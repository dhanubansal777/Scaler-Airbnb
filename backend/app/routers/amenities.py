from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/amenities", tags=["amenities"])


@router.get("", response_model=list[schemas.AmenityOut])
def list_amenities(db: Session = Depends(get_db)):
    return db.query(models.Amenity).order_by(models.Amenity.name).all()
