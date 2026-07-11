import random
from datetime import date, timedelta

from .auth import hash_password
from .database import Base, SessionLocal, engine
from .models import Amenity, Booking, BookingStatus, Favorite, Listing, ListingPhoto, Review, User

random.seed(42)

# Hand-verified Unsplash photo IDs depicting real bedrooms, living rooms,
# kitchens, bathrooms, and house exteriors (checked to actually resolve and
# show relevant listing-style photography, not just keyword-matched noise).
INTERIOR_PHOTO_IDS = [
    "1522708323590-d24dbb6b0267",
    "1560448204-603b3fc33ddc",
    "1600585154340-be6161a56a0c",
    "1616486338812-3dadae4b4ace",
    "1522771739844-6a9f6d5f14af",
    "1493809842364-78817add7ffb",
    "1484154218962-a197022b5858",
    "1512918728675-ed5a9ecdebfd",
    "1600607687939-ce8a6c25118c",
    "1583847268964-b28dc8f51f92",
    "1554995207-c18c203602cb",
    "1560185008-b033106af5c3",
    "1505873242700-f289a29e1e0f",
    "1493663284031-b7e3aefcae8e",
    "1556909114-f6e7ad7d3136",
    "1556911220-e15b29be8c8f",
    "1600489000022-c2086d79f9d4",
    "1552321554-5fefe8c9ef14",
    "1584622650111-993a426fbf0a",
    "1571508601891-ca5e7a713859",
    "1598928506311-c55ded91a20c",
    "1584622781564-1d987f7333c1",
    "1591088398332-8a7791972843",
    "1560184897-ae75f418493e",
    "1519710164239-da123dc03ef4",
    "1502672260266-1c1ef2d93688",
    "1567767292278-a4f21aa2d36e",
    "1615874959474-d609969a20ed",
    "1615873968403-89e068629265",
    "1598300042247-d088f8ab3a91",
    "1600210492486-724fe5c67fb0",
    "1600121848594-d8644e57abab",
    "1600566753086-00f18fb6b3ea",
    "1600585152220-90363fe7e115",
    "1616137466211-f939a420be84",
    "1618221195710-dd6b41faaea6",
]

AMENITIES = [
    ("WiFi", "wifi"),
    ("Kitchen", "kitchen"),
    ("Free parking", "parking"),
    ("Pool", "pool"),
    ("Hot tub", "hot-tub"),
    ("Air conditioning", "ac"),
    ("Washer", "washer"),
    ("Dryer", "dryer"),
    ("TV", "tv"),
    ("Workspace", "workspace"),
    ("Fireplace", "fireplace"),
    ("Gym", "gym"),
    ("Ocean view", "ocean-view"),
    ("Mountain view", "mountain-view"),
    ("Pets allowed", "pets"),
    ("EV charger", "ev-charger"),
    ("BBQ grill", "bbq"),
    ("Breakfast included", "breakfast"),
]

CITIES = [
    ("Mumbai", "Maharashtra", 19.0760, 72.8777),
    ("New Delhi", "Delhi", 28.6139, 77.2090),
    ("Bengaluru", "Karnataka", 12.9716, 77.5946),
    ("Goa", "Goa", 15.2993, 74.1240),
    ("Jaipur", "Rajasthan", 26.9124, 75.7873),
    ("Udaipur", "Rajasthan", 24.5854, 73.7125),
    ("Gurugram", "Haryana", 28.4595, 77.0266),
    ("Dehradun", "Uttarakhand", 30.3165, 78.0322),
]

PROPERTY_TYPES = ["House", "Apartment", "Guesthouse", "Cabin", "Villa", "Loft", "Cottage"]
ROOM_TYPES = ["Entire place", "Private room", "Shared room"]

TITLE_TEMPLATES = [
    "Cozy {ptype} in {city}",
    "Modern {ptype} near downtown {city}",
    "Charming {ptype} with skyline views",
    "Sunny {ptype} minutes from the heart of {city}",
    "Stylish {ptype} retreat in {city}",
    "Spacious {ptype} perfect for a getaway",
    "Renovated {ptype} steps from local favorites",
    "Peaceful {ptype} tucked away in {city}",
]

DESCRIPTION = (
    "Welcome to this beautifully appointed {ptype_lower} in {city}, {state}. "
    "Enjoy a comfortable stay with everything you need for work or relaxation. "
    "The space is thoughtfully designed, close to top restaurants, parks, and attractions, "
    "and perfect for couples, families, or solo travelers looking to explore {city}."
)

HOST_NAMES = ["Priya Nair", "Arjun Mehta", "Ananya Sharma", "Rohan Kapoor"]
GUEST_NAMES = ["Aditya Verma", "Sneha Reddy"]

REVIEW_COMMENTS = [
    "Amazing stay! The place was spotless and exactly as described.",
    "Great location and super communicative host. Would book again.",
    "Loved the amenities, especially the kitchen setup. Highly recommend.",
    "Comfortable beds and a quiet neighborhood. Perfect for our trip.",
    "Check-in was seamless and the photos didn't do it justice.",
    "A bit small but very cozy and well located near everything.",
    "Host went above and beyond to make our stay memorable.",
    "Beautiful views and a very relaxing atmosphere overall.",
]


def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded, skipping.")
            return

        amenities = []
        for name, icon in AMENITIES:
            amenity = Amenity(name=name, icon=icon)
            db.add(amenity)
            amenities.append(amenity)
        db.flush()

        hosts = []
        for i, name in enumerate(HOST_NAMES):
            user = User(
                email=f"host{i+1}@example.com",
                hashed_password=hash_password("password123"),
                name=name,
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}",
                is_host=True,
            )
            db.add(user)
            hosts.append(user)

        guests = []
        for i, name in enumerate(GUEST_NAMES):
            user = User(
                email=f"guest{i+1}@example.com",
                hashed_password=hash_password("password123"),
                name=name,
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}",
                is_host=False,
            )
            db.add(user)
            guests.append(user)
        db.flush()

        all_travelers = hosts + guests

        listings = []
        listing_count = 24
        for idx in range(listing_count):
            city, state, lat, lng = CITIES[idx % len(CITIES)]
            ptype = random.choice(PROPERTY_TYPES)
            rtype = random.choice(ROOM_TYPES)
            title = random.choice(TITLE_TEMPLATES).format(ptype=ptype, city=city)
            host = hosts[idx % len(hosts)]
            price = random.randint(1800, 14000)
            max_guests = random.choice([2, 2, 3, 4, 4, 6, 8])
            bedrooms = random.randint(1, min(4, max_guests))
            beds = bedrooms + random.randint(0, 2)
            bathrooms = random.choice([1, 1, 1.5, 2, 2.5])
            jitter_lat = lat + random.uniform(-0.05, 0.05)
            jitter_lng = lng + random.uniform(-0.05, 0.05)

            listing = Listing(
                host_id=host.id,
                title=title,
                description=DESCRIPTION.format(ptype_lower=ptype.lower(), city=city, state=state),
                property_type=ptype,
                room_type=rtype,
                city=city,
                state=state,
                country="India",
                latitude=jitter_lat,
                longitude=jitter_lng,
                price_per_night=float(price),
                cleaning_fee=float(random.choice([599, 799, 999, 1499, 1999])),
                max_guests=max_guests,
                bedrooms=bedrooms,
                beds=beds,
                bathrooms=bathrooms,
            )
            db.add(listing)
            db.flush()

            photo_count = random.randint(4, 6)
            chosen_photo_ids = random.sample(INTERIOR_PHOTO_IDS, k=photo_count)
            for p, photo_id in enumerate(chosen_photo_ids):
                db.add(
                    ListingPhoto(
                        listing_id=listing.id,
                        url=f"https://images.unsplash.com/photo-{photo_id}?w=900&h=650&fit=crop",
                        sort_order=p,
                    )
                )

            listing.amenities = random.sample(amenities, k=random.randint(5, 9))
            listings.append(listing)

        db.flush()

        today = date.today()
        bookings = []
        for i in range(20):
            listing = random.choice(listings)
            guest = random.choice(all_travelers)
            if guest.id == listing.host_id:
                continue

            is_past = i < 12
            if is_past:
                start_offset = -random.randint(20, 200)
            else:
                start_offset = random.randint(5, 120)
            nights = random.randint(2, 7)
            check_in = today + timedelta(days=start_offset)
            check_out = check_in + timedelta(days=nights)

            overlap = any(
                b.listing_id == listing.id and b.check_in < check_out and b.check_out > check_in for b in bookings
            )
            if overlap:
                continue

            subtotal = listing.price_per_night * nights
            service_fee = round(subtotal * 0.12, 2)
            total = round(subtotal + listing.cleaning_fee + service_fee, 2)

            booking = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=check_in,
                check_out=check_out,
                guests_count=random.randint(1, listing.max_guests),
                nightly_rate_snapshot=listing.price_per_night,
                cleaning_fee_snapshot=listing.cleaning_fee,
                service_fee_snapshot=service_fee,
                total_price=total,
                status=BookingStatus.confirmed.value,
            )
            db.add(booking)
            db.flush()
            bookings.append(booking)

            if is_past:
                booking._is_past = True

        db.flush()

        reviewed_listing_ids = set()
        for booking in bookings:
            if getattr(booking, "_is_past", False) and random.random() < 0.8:
                db.add(
                    Review(
                        listing_id=booking.listing_id,
                        booking_id=booking.id,
                        author_id=booking.guest_id,
                        rating=random.choice([4, 4, 5, 5, 5, 3]),
                        comment=random.choice(REVIEW_COMMENTS),
                    )
                )
                reviewed_listing_ids.add(booking.listing_id)

        db.flush()

        # Guarantee every listing has at least one review so its rating/star always shows.
        for listing in listings:
            if listing.id in reviewed_listing_ids:
                continue
            guest = next((g for g in all_travelers if g.id != listing.host_id), all_travelers[0])
            check_in = today - timedelta(days=random.randint(30, 250))
            nights = random.randint(2, 5)
            check_out = check_in + timedelta(days=nights)
            subtotal = listing.price_per_night * nights
            service_fee = round(subtotal * 0.12, 2)
            total = round(subtotal + listing.cleaning_fee + service_fee, 2)

            fallback_booking = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=check_in,
                check_out=check_out,
                guests_count=random.randint(1, listing.max_guests),
                nightly_rate_snapshot=listing.price_per_night,
                cleaning_fee_snapshot=listing.cleaning_fee,
                service_fee_snapshot=service_fee,
                total_price=total,
                status=BookingStatus.confirmed.value,
            )
            db.add(fallback_booking)
            db.flush()
            db.add(
                Review(
                    listing_id=listing.id,
                    booking_id=fallback_booking.id,
                    author_id=guest.id,
                    rating=random.choice([4, 5, 5]),
                    comment=random.choice(REVIEW_COMMENTS),
                )
            )
            reviewed_listing_ids.add(listing.id)

        # Deliberately leave guest1's most recent past stay unreviewed, so the
        # "leave a review" prompt (on both /trips and the listing page) has a
        # real, reliable case to demonstrate against out of the box.
        guest1 = guests[0]
        unreviewed_listing = next((l for l in listings if l.host_id != guest1.id), listings[0])
        unreviewed_nights = 3
        unreviewed_check_in = today - timedelta(days=10)
        unreviewed_check_out = unreviewed_check_in + timedelta(days=unreviewed_nights)
        unreviewed_subtotal = unreviewed_listing.price_per_night * unreviewed_nights
        unreviewed_service_fee = round(unreviewed_subtotal * 0.12, 2)
        unreviewed_total = round(unreviewed_subtotal + unreviewed_listing.cleaning_fee + unreviewed_service_fee, 2)
        db.add(
            Booking(
                listing_id=unreviewed_listing.id,
                guest_id=guest1.id,
                check_in=unreviewed_check_in,
                check_out=unreviewed_check_out,
                guests_count=1,
                nightly_rate_snapshot=unreviewed_listing.price_per_night,
                cleaning_fee_snapshot=unreviewed_listing.cleaning_fee,
                service_fee_snapshot=unreviewed_service_fee,
                total_price=unreviewed_total,
                status=BookingStatus.confirmed.value,
            )
        )

        for guest in all_travelers:
            for listing in random.sample(listings, k=random.randint(1, 3)):
                if listing.host_id == guest.id:
                    continue
                db.add(Favorite(user_id=guest.id, listing_id=listing.id))

        db.commit()
        print(f"Seeded {len(hosts)} hosts, {len(guests)} guests, {len(listings)} listings, {len(bookings)} bookings.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
