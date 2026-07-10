from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_host
from ..utils import cover_photo, listing_rating_stats

router = APIRouter(prefix="/api/host", tags=["host"])


@router.get("/listings", response_model=list[schemas.HostListingOut])
def host_listings(db: Session = Depends(get_db), current_user: models.User = Depends(require_host)):
    listings = db.query(models.Listing).filter(models.Listing.host_id == current_user.id).all()
    result = []
    for listing in listings:
        avg_rating, review_count = listing_rating_stats(db, listing.id)
        booking_count = (
            db.query(models.Booking)
            .filter(models.Booking.listing_id == listing.id, models.Booking.status == "confirmed")
            .count()
        )
        result.append(
            schemas.HostListingOut(
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
                booking_count=booking_count,
            )
        )
    return result


@router.get("/bookings", response_model=list[schemas.HostBookingOut])
def host_bookings(db: Session = Depends(get_db), current_user: models.User = Depends(require_host)):
    bookings = (
        db.query(models.Booking)
        .join(models.Listing, models.Booking.listing_id == models.Listing.id)
        .filter(models.Listing.host_id == current_user.id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    result = []
    for booking in bookings:
        result.append(
            schemas.HostBookingOut(
                id=booking.id,
                listing_id=booking.listing_id,
                check_in=booking.check_in,
                check_out=booking.check_out,
                guests_count=booking.guests_count,
                nightly_rate_snapshot=booking.nightly_rate_snapshot,
                cleaning_fee_snapshot=booking.cleaning_fee_snapshot,
                service_fee_snapshot=booking.service_fee_snapshot,
                total_price=booking.total_price,
                status=booking.status,
                created_at=booking.created_at,
                listing=schemas.BookingListingSummary(
                    id=booking.listing.id,
                    title=booking.listing.title,
                    city=booking.listing.city,
                    state=booking.listing.state,
                    cover_photo=cover_photo(booking.listing),
                ),
                has_review=booking.review is not None,
                guest=schemas.ReviewAuthorOut(
                    id=booking.guest.id, name=booking.guest.name, avatar_url=booking.guest.avatar_url
                ),
            )
        )
    return result
