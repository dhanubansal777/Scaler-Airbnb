import math
import os
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_optional_user, require_host
from ..models import BookingStatus
from ..utils import cover_photo, is_superhost, listing_rating_stats

router = APIRouter(prefix="/api/listings", tags=["listings"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")


def _card_out(db: Session, listing: models.Listing, favorited_ids: set[int]) -> schemas.ListingCardOut:
    avg_rating, review_count = listing_rating_stats(db, listing.id)
    return schemas.ListingCardOut(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        property_type=listing.property_type,
        room_type=listing.room_type,
        price_per_night=listing.price_per_night,
        cover_photo=cover_photo(listing),
        avg_rating=avg_rating,
        review_count=review_count,
        is_favorited=listing.id in favorited_ids,
    )


def _favorited_ids(db: Session, user: Optional[models.User]) -> set[int]:
    if not user:
        return set()
    rows = db.query(models.Favorite.listing_id).filter(models.Favorite.user_id == user.id).all()
    return {r[0] for r in rows}


def _listing_available(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    overlap = (
        db.query(models.Booking)
        .filter(
            models.Booking.listing_id == listing_id,
            models.Booking.status == BookingStatus.confirmed.value,
            models.Booking.check_in < check_out,
            models.Booking.check_out > check_in,
        )
        .first()
    )
    return overlap is None


@router.get("", response_model=schemas.PaginatedListings)
def list_listings(
    location: Optional[str] = None,
    checkin: Optional[date] = None,
    checkout: Optional[date] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    amenities: Optional[str] = Query(default=None, description="comma separated amenity ids"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    query = db.query(models.Listing)

    if location:
        like = f"%{location}%"
        query = query.filter(or_(models.Listing.city.ilike(like), models.Listing.state.ilike(like), models.Listing.country.ilike(like)))
    if guests:
        query = query.filter(models.Listing.max_guests >= guests)
    if min_price is not None:
        query = query.filter(models.Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(models.Listing.price_per_night <= max_price)
    if property_type:
        query = query.filter(models.Listing.property_type == property_type)

    if amenities:
        amenity_ids = [int(a) for a in amenities.split(",") if a.strip().isdigit()]
        for amenity_id in amenity_ids:
            query = query.filter(models.Listing.amenities.any(models.Amenity.id == amenity_id))

    all_matches = query.all()

    if checkin and checkout:
        if checkout <= checkin:
            raise HTTPException(status_code=400, detail="checkout must be after checkin")
        all_matches = [l for l in all_matches if _listing_available(db, l.id, checkin, checkout)]

    total = len(all_matches)
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    page_items = all_matches[start : start + page_size]

    favorited_ids = _favorited_ids(db, current_user)
    items = [_card_out(db, listing, favorited_ids) for listing in page_items]

    return schemas.PaginatedListings(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/{listing_id}", response_model=schemas.ListingDetailOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    avg_rating, review_count = listing_rating_stats(db, listing.id)
    favorited_ids = _favorited_ids(db, current_user)

    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.listing_id == listing_id, models.Booking.status == BookingStatus.confirmed.value)
        .all()
    )
    booked_ranges = [{"check_in": str(b.check_in), "check_out": str(b.check_out)} for b in bookings]

    host_superhost = is_superhost(db, listing.host_id)

    return schemas.ListingDetailOut(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        room_type=listing.room_type,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        created_at=listing.created_at,
        photos=[schemas.ListingPhotoOut.model_validate(p) for p in listing.photos],
        amenities=[schemas.AmenityOut.model_validate(a) for a in listing.amenities],
        host=schemas.HostOut(
            id=listing.host.id,
            name=listing.host.name,
            avatar_url=listing.host.avatar_url,
            is_superhost=host_superhost,
            created_at=listing.host.created_at,
        ),
        avg_rating=avg_rating,
        review_count=review_count,
        is_favorited=listing.id in favorited_ids,
        booked_ranges=booked_ranges,
    )


@router.post("", response_model=schemas.ListingDetailOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: schemas.ListingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_host),
):
    listing = models.Listing(
        host_id=current_user.id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        room_type=payload.room_type,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
    )
    if payload.amenity_ids:
        listing.amenities = db.query(models.Amenity).filter(models.Amenity.id.in_(payload.amenity_ids)).all()
    db.add(listing)
    db.flush()
    for i, url in enumerate(payload.photo_urls):
        db.add(models.ListingPhoto(listing_id=listing.id, url=url, sort_order=i))
    db.commit()
    db.refresh(listing)
    return get_listing(listing.id, db=db, current_user=current_user)


@router.patch("/{listing_id}", response_model=schemas.ListingDetailOut)
def update_listing(
    listing_id: int,
    payload: schemas.ListingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    data = payload.model_dump(exclude_unset=True)
    photo_urls = data.pop("photo_urls", None)
    amenity_ids = data.pop("amenity_ids", None)

    for field, value in data.items():
        setattr(listing, field, value)

    if photo_urls is not None:
        db.query(models.ListingPhoto).filter(models.ListingPhoto.listing_id == listing.id).delete()
        for i, url in enumerate(photo_urls):
            db.add(models.ListingPhoto(listing_id=listing.id, url=url, sort_order=i))

    if amenity_ids is not None:
        listing.amenities = db.query(models.Amenity).filter(models.Amenity.id.in_(amenity_ids)).all()

    db.commit()
    db.refresh(listing)
    return get_listing(listing.id, db=db, current_user=current_user)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    db.delete(listing)
    db.commit()
    return None


@router.post("/{listing_id}/photos")
def upload_photo(
    listing_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        f.write(file.file.read())

    url = f"/static/uploads/{filename}"
    return {"url": url}
