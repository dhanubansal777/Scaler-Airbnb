from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..utils import cover_photo, is_superhost, listing_rating_stats

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.post("/{listing_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = (
        db.query(models.Favorite)
        .filter(models.Favorite.user_id == current_user.id, models.Favorite.listing_id == listing_id)
        .first()
    )
    if existing:
        return {"favorited": True}

    db.add(models.Favorite(user_id=current_user.id, listing_id=listing_id))
    db.commit()
    return {"favorited": True}


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id, models.Favorite.listing_id == listing_id
    ).delete()
    db.commit()
    return None


@router.get("/me", response_model=list[schemas.ListingCardOut])
def my_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    favorites = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    result = []
    for fav in favorites:
        listing = fav.listing
        avg_rating, review_count = listing_rating_stats(db, listing.id)
        result.append(
            schemas.ListingCardOut(
                id=listing.id,
                title=listing.title,
                city=listing.city,
                state=listing.state,
                country=listing.country,
                property_type=listing.property_type,
                room_type=listing.room_type,
                price_per_night=listing.price_per_night,
                latitude=listing.latitude,
                longitude=listing.longitude,
                cover_photo=cover_photo(listing),
                avg_rating=avg_rating,
                review_count=review_count,
                is_favorited=True,
                is_superhost=is_superhost(db, listing.host_id),
            )
        )
    return result
