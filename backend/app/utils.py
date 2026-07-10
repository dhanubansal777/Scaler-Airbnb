from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models

SERVICE_FEE_RATE = 0.12
SUPERHOST_MIN_RATING = 4.8
SUPERHOST_MIN_REVIEWS = 3


def listing_rating_stats(db: Session, listing_id: int) -> tuple[float, int]:
    row = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .filter(models.Review.listing_id == listing_id)
        .one()
    )
    avg_rating, count = row
    return (round(avg_rating, 2) if avg_rating else 0.0, count or 0)


def host_rating_stats(db: Session, host_id: int) -> tuple[float, int]:
    row = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .join(models.Listing, models.Review.listing_id == models.Listing.id)
        .filter(models.Listing.host_id == host_id)
        .one()
    )
    avg_rating, count = row
    return (round(avg_rating, 2) if avg_rating else 0.0, count or 0)


def is_superhost(db: Session, host_id: int) -> bool:
    avg_rating, count = host_rating_stats(db, host_id)
    return avg_rating >= SUPERHOST_MIN_RATING and count >= SUPERHOST_MIN_REVIEWS


def cover_photo(listing: models.Listing) -> str | None:
    if listing.photos:
        return listing.photos[0].url
    return None


def compute_price_breakdown(nightly_rate: float, cleaning_fee: float, nights: int) -> dict:
    subtotal = nightly_rate * nights
    service_fee = round(subtotal * SERVICE_FEE_RATE, 2)
    total = round(subtotal + cleaning_fee + service_fee, 2)
    return {
        "nightly_rate": nightly_rate,
        "nights": nights,
        "subtotal": round(subtotal, 2),
        "cleaning_fee": cleaning_fee,
        "service_fee": service_fee,
        "total": total,
    }
