from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..models import BookingStatus
from ..utils import compute_price_breakdown

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _booking_out(booking: models.Booking) -> schemas.BookingOut:
    return schemas.BookingOut(
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
            cover_photo=booking.listing.photos[0].url if booking.listing.photos else None,
        )
        if booking.listing
        else None,
        has_review=booking.review is not None,
    )


@router.post("", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if payload.check_in < date.today():
        raise HTTPException(status_code=400, detail="check_in cannot be in the past")

    if payload.guests_count > listing.max_guests:
        raise HTTPException(status_code=400, detail=f"This listing sleeps at most {listing.max_guests} guests")

    overlap = (
        db.query(models.Booking)
        .filter(
            models.Booking.listing_id == payload.listing_id,
            models.Booking.status == BookingStatus.confirmed.value,
            models.Booking.check_in < payload.check_out,
            models.Booking.check_out > payload.check_in,
        )
        .first()
    )
    if overlap:
        raise HTTPException(status_code=409, detail="These dates are not available for this listing")

    nights = (payload.check_out - payload.check_in).days
    breakdown = compute_price_breakdown(listing.price_per_night, listing.cleaning_fee, nights)

    booking = models.Booking(
        listing_id=listing.id,
        guest_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests_count=payload.guests_count,
        nightly_rate_snapshot=listing.price_per_night,
        cleaning_fee_snapshot=listing.cleaning_fee,
        service_fee_snapshot=breakdown["service_fee"],
        total_price=breakdown["total"],
        status=BookingStatus.confirmed.value,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _booking_out(booking)


@router.get("/me", response_model=list[schemas.BookingOut])
def my_bookings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.guest_id == current_user.id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    return [_booking_out(b) for b in bookings]


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    booking.status = BookingStatus.cancelled.value
    db.commit()
    return None
