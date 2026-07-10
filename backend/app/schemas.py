from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str
    is_host: bool
    is_superhost: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Amenities ----------
class AmenityOut(BaseModel):
    id: int
    name: str
    icon: str

    model_config = {"from_attributes": True}


# ---------- Photos ----------
class ListingPhotoOut(BaseModel):
    id: int
    url: str
    sort_order: int

    model_config = {"from_attributes": True}


# ---------- Host (nested, lightweight) ----------
class HostOut(BaseModel):
    id: int
    name: str
    avatar_url: str
    is_superhost: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Listings ----------
class ListingBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    property_type: str = "House"
    room_type: str = "Entire place"
    city: str
    state: str = ""
    country: str = "United States"
    latitude: float = 0.0
    longitude: float = 0.0
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = Field(ge=0, default=999.0)
    max_guests: int = Field(ge=1, default=2)
    bedrooms: int = Field(ge=0, default=1)
    beds: int = Field(ge=0, default=1)
    bathrooms: float = Field(ge=0, default=1.0)


class ListingCreate(ListingBase):
    photo_urls: list[str] = []
    amenity_ids: list[int] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = Field(default=None, gt=0)
    cleaning_fee: Optional[float] = Field(default=None, ge=0)
    max_guests: Optional[int] = Field(default=None, ge=1)
    bedrooms: Optional[int] = Field(default=None, ge=0)
    beds: Optional[int] = Field(default=None, ge=0)
    bathrooms: Optional[float] = Field(default=None, ge=0)
    photo_urls: Optional[list[str]] = None
    amenity_ids: Optional[list[int]] = None


class ListingCardOut(BaseModel):
    id: int
    title: str
    city: str
    state: str
    country: str
    property_type: str
    room_type: str
    price_per_night: float
    cover_photo: Optional[str] = None
    avg_rating: float = 0.0
    review_count: int = 0
    is_favorited: bool = False

    model_config = {"from_attributes": True}


class ListingDetailOut(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    room_type: str
    city: str
    state: str
    country: str
    latitude: float
    longitude: float
    price_per_night: float
    cleaning_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    created_at: datetime
    photos: list[ListingPhotoOut]
    amenities: list[AmenityOut]
    host: HostOut
    avg_rating: float = 0.0
    review_count: int = 0
    is_favorited: bool = False
    booked_ranges: list[dict] = []

    model_config = {"from_attributes": True}


class PaginatedListings(BaseModel):
    items: list[ListingCardOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------- Bookings ----------
class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests_count: int = Field(ge=1, default=1)

    @field_validator("check_out")
    @classmethod
    def check_out_after_check_in(cls, v, info):
        check_in = info.data.get("check_in")
        if check_in and v <= check_in:
            raise ValueError("check_out must be after check_in")
        return v


class BookingListingSummary(BaseModel):
    id: int
    title: str
    city: str
    state: str
    cover_photo: Optional[str] = None

    model_config = {"from_attributes": True}


class BookingOut(BaseModel):
    id: int
    listing_id: int
    check_in: date
    check_out: date
    guests_count: int
    nightly_rate_snapshot: float
    cleaning_fee_snapshot: float
    service_fee_snapshot: float
    total_price: float
    status: str
    created_at: datetime
    listing: Optional[BookingListingSummary] = None
    has_review: bool = False

    model_config = {"from_attributes": True}


# ---------- Reviews ----------
class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewAuthorOut(BaseModel):
    id: int
    name: str
    avatar_url: str

    model_config = {"from_attributes": True}


class ReviewOut(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    author: ReviewAuthorOut

    model_config = {"from_attributes": True}


# ---------- Favorites ----------
class FavoriteOut(BaseModel):
    listing: ListingCardOut

    model_config = {"from_attributes": True}


# ---------- Host dashboard ----------
class HostListingOut(ListingCardOut):
    booking_count: int = 0


class HostBookingOut(BookingOut):
    guest: ReviewAuthorOut
