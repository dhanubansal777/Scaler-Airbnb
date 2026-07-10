from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..models import BookingStatus

router = APIRouter(prefix="/api/listings", tags=["reviews"])


@router.post("/{listing_id}/reviews", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    listing_id: int,
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    booking = db.get(models.Booking, payload.booking_id)
    if not booking or booking.listing_id != listing_id:
        raise HTTPException(status_code=404, detail="Booking not found for this listing")
    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    if booking.status != BookingStatus.confirmed.value:
        raise HTTPException(status_code=400, detail="Cannot review a cancelled booking")
    if booking.check_out > date.today():
        raise HTTPException(status_code=400, detail="You can only review completed stays")
    if booking.review is not None:
        raise HTTPException(status_code=400, detail="You already reviewed this stay")

    review = models.Review(
        listing_id=listing_id,
        booking_id=booking.id,
        author_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return schemas.ReviewOut.model_validate(review)


@router.get("/{listing_id}/reviews", response_model=list[schemas.ReviewOut])
def list_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.listing_id == listing_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [schemas.ReviewOut.model_validate(r) for r in reviews]
