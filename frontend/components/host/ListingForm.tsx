"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Upload, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { AmenityIcon } from "@/lib/amenity-icons";
import { PROPERTY_TYPES, ROOM_TYPES } from "@/lib/types";
import type { Amenity, ListingDetail } from "@/lib/types";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

interface FormState {
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: string;
  cleaning_fee: string;
  max_guests: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  amenity_ids: number[];
  photo_urls: string[];
}

const emptyForm: FormState = {
  title: "",
  description: "",
  property_type: "House",
  room_type: "Entire place",
  city: "",
  state: "",
  country: "United States",
  latitude: 0,
  longitude: 0,
  price_per_night: "",
  cleaning_fee: "999",
  max_guests: "2",
  bedrooms: "1",
  beds: "1",
  bathrooms: "1",
  amenity_ids: [],
  photo_urls: [],
};

export default function ListingForm({ mode, listingId, initial }: { mode: "create" | "edit"; listingId?: number; initial?: ListingDetail }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Amenity[]>("/api/amenities").then(setAmenities).catch(() => setAmenities([]));
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        property_type: initial.property_type,
        room_type: initial.room_type,
        city: initial.city,
        state: initial.state,
        country: initial.country,
        latitude: initial.latitude,
        longitude: initial.longitude,
        price_per_night: String(initial.price_per_night),
        cleaning_fee: String(initial.cleaning_fee),
        max_guests: String(initial.max_guests),
        bedrooms: String(initial.bedrooms),
        beds: String(initial.beds),
        bathrooms: String(initial.bathrooms),
        amenity_ids: initial.amenities.map((a) => a.id),
        photo_urls: initial.photos.map((p) => p.url),
      });
    }
  }, [initial]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (id: number) => {
    setForm((f) => ({
      ...f,
      amenity_ids: f.amenity_ids.includes(id) ? f.amenity_ids.filter((a) => a !== id) : [...f.amenity_ids, id],
    }));
  };

  const addPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    update("photo_urls", [...form.photo_urls, photoUrlInput.trim()]);
    setPhotoUrlInput("");
  };

  const removePhoto = (url: string) => update("photo_urls", form.photo_urls.filter((u) => u !== url));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !listingId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url: string }>(`/api/listings/${listingId}/photos`, formData);
      const fullUrl = res.url.startsWith("http") ? res.url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${res.url}`;
      update("photo_urls", [...form.photo_urls, fullUrl]);
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required";
    if (!form.city.trim()) return "City is required";
    if (!form.price_per_night || Number(form.price_per_night) <= 0) return "Price per night must be greater than 0";
    if (form.photo_urls.length === 0) return "Add at least one photo";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      room_type: form.room_type,
      city: form.city,
      state: form.state,
      country: form.country,
      latitude: form.latitude,
      longitude: form.longitude,
      price_per_night: Number(form.price_per_night),
      cleaning_fee: Number(form.cleaning_fee || 0),
      max_guests: Number(form.max_guests || 1),
      bedrooms: Number(form.bedrooms || 0),
      beds: Number(form.beds || 0),
      bathrooms: Number(form.bathrooms || 1),
      amenity_ids: form.amenity_ids,
      photo_urls: form.photo_urls,
    };
    try {
      if (mode === "create") {
        await api.post("/api/listings", payload);
        toast.success("Listing created!");
      } else {
        await api.patch(`/api/listings/${listingId}`, payload);
        toast.success("Listing updated!");
      }
      router.push("/host");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!listingId || !confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.del(`/api/listings/${listingId}`);
      toast.success("Listing deleted");
      router.push("/host");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete listing");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{mode === "create" ? "List your place" : "Edit listing"}</h1>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>

      <Section title="Basics">
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Sunny loft with skyline views"
            className="input"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            placeholder="Tell guests what makes your place special"
            className="input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Property type">
            <select value={form.property_type} onChange={(e) => update("property_type", e.target.value)} className="input">
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Room type">
            <select value={form.room_type} onChange={(e) => update("room_type", e.target.value)} className="input">
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City">
            <input required value={form.city} onChange={(e) => update("city", e.target.value)} className="input" />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={(e) => update("state", e.target.value)} className="input" />
          </Field>
          <Field label="Country">
            <input value={form.country} onChange={(e) => update("country", e.target.value)} className="input" />
          </Field>
        </div>
        <p className="text-xs text-muted">Click the map to drop a pin (optional — used for the listing map preview).</p>
        <LocationPicker lat={form.latitude} lng={form.longitude} onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))} />
      </Section>

      <Section title="Capacity">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Guests">
            <input type="number" min={1} value={form.max_guests} onChange={(e) => update("max_guests", e.target.value)} className="input" />
          </Field>
          <Field label="Bedrooms">
            <input type="number" min={0} value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className="input" />
          </Field>
          <Field label="Beds">
            <input type="number" min={0} value={form.beds} onChange={(e) => update("beds", e.target.value)} className="input" />
          </Field>
          <Field label="Bathrooms">
            <input type="number" min={0} step={0.5} value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className="input" />
          </Field>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price per night (₹)">
            <input required type="number" min={1} value={form.price_per_night} onChange={(e) => update("price_per_night", e.target.value)} className="input" />
          </Field>
          <Field label="Cleaning fee (₹)">
            <input type="number" min={0} value={form.cleaning_fee} onChange={(e) => update("cleaning_fee", e.target.value)} className="input" />
          </Field>
        </div>
      </Section>

      <Section title="Amenities">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities.map((a) => {
            const active = form.amenity_ids.includes(a.id);
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => toggleAmenity(a.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                }`}
              >
                <AmenityIcon icon={a.icon} size={16} />
                {a.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Photos">
        <div className="flex gap-2">
          <input
            value={photoUrlInput}
            onChange={(e) => setPhotoUrlInput(e.target.value)}
            placeholder="Paste an image URL"
            className="input flex-1"
          />
          <button type="button" onClick={addPhotoUrl} className="rounded-lg border border-border px-4 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10">
            Add
          </button>
          {mode === "edit" && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
              >
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload"}
              </button>
            </>
          )}
        </div>
        {mode === "create" && <p className="text-xs text-muted">You can upload files directly once the listing is created — for now, paste image URLs.</p>}

        {form.photo_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {form.photo_urls.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-muted/20">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-b border-border pb-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
