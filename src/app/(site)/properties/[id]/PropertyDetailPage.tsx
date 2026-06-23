"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Bed,
  Maximize,
  Building2,
  Shield,
  Car,
  Sun,
} from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import PropertyCard from "@/components/PropertyCard";
import PropertyActionMenu from "@/components/admin/PropertyActionMenu";
import PropertyEditModal from "@/components/admin/PropertyEditModal";
import type { Property } from "@/lib/types";
import { formatPrice, getCityLabel } from "@/lib/constants";
import { resolvePropertyRecordId } from "@/lib/properties/ids";
import { deleteCatalogProperty } from "@/lib/properties/property-actions";
import type { CatalogProperty } from "@/lib/properties/catalog-schema";

interface PropertyDetailPageProps {
  property: Property;
  related?: Property[];
  canEdit?: boolean;
}

export default function PropertyDetailPage({
  property,
  related = [],
  canEdit = false,
}: PropertyDetailPageProps) {
  const router = useRouter();
  const propertyRecord = property as Property & { _id?: unknown };
  const cleanId = resolvePropertyRecordId(propertyRecord);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [loadingAction, setLoadingAction] = useState<"edit" | "duplicate" | "delete" | null>(
    null,
  );
  const [actionError, setActionError] = useState("");

  const handleOpenEdit = () => {
    setActionError("");
    if (!cleanId) {
      setActionError("מזהה נכס לא תקין");
      return;
    }
    console.log("Modal opening with ID:", cleanId);
    setEditId(cleanId);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditId("");
  };

  const handleDuplicate = async () => {
    if (!cleanId) {
      setActionError("מזהה נכס לא תקין");
      return;
    }

    setActionError("");
    setLoadingAction("duplicate");

    try {
      const response = await fetch(`/api/catalog/properties/${encodeURIComponent(cleanId)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Server status: ${response.status}`);

      const data = await response.json();
      if (!data.raw) {
        throw new Error("לא ניתן לטעון את פרטי הנכס לשכפול");
      }

      const raw = data.raw as CatalogProperty;
      const { id: _omitId, recruitedAt: _r, updatedAt: _u, ...rest } = raw;
      sessionStorage.setItem(
        "rehouse:duplicate-property",
        JSON.stringify({
          ...rest,
          title: `${raw.title} (עותק)`,
          published: false,
        }),
      );
      router.push(`/admin/property/new?duplicate=1&id=${encodeURIComponent(cleanId)}`);
    } catch (err) {
      console.error("RAW DUPLICATE ERROR:", err);
      setActionError(err instanceof Error ? err.message : "שכפול הנכס נכשל");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setActionError("");

    const confirmed = window.confirm(
      "האם למחוק את הנכס מהקטלוג? הנכס יוסר מהאתר אך יישמר במערכת כלא מפורסם.",
    );
    if (!confirmed) return;

    setLoadingAction("delete");

    try {
      await deleteCatalogProperty(cleanId);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "מחיקת הנכס נכשלה");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <section className="pt-24 pb-12 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-gold-400"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לקטלוג
          </Link>

          {canEdit && cleanId ? (
            <div className="mb-6">
              <PropertyActionMenu
                onEdit={handleOpenEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                loadingAction={loadingAction}
              />
              {actionError ? (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">{actionError}</p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Gallery + details */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-[16/10] overflow-hidden rounded-2xl"
              >
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                <div className="absolute start-4 top-4 flex gap-2">
                  {property.featured && (
                    <span className="rounded-full bg-gold-500/90 px-3 py-1 text-xs font-medium text-navy-950">
                      מומלץ
                    </span>
                  )}
                  <span className="rounded-full bg-navy-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {property.listingType === "buy" ? "למכירה" : "להשכרה"}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8"
              >
                <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                  {property.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-white/50">
                  <MapPin className="h-4 w-4 text-gold-500/70" />
                  {getCityLabel(property.city)}, {property.neighborhood}
                </div>
                <p className="mt-2 font-display text-3xl font-bold text-gold-400">
                  {formatPrice(property.price, property.listingType)}
                </p>
                <p className="mt-6 leading-relaxed text-white/60">{property.description}</p>

                {/* Specs grid */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Spec icon={<Bed className="h-4 w-4" />} label="חדרים" value={String(property.rooms)} />
                  <Spec icon={<Maximize className="h-4 w-4" />} label="שטח" value={`${property.area} מ״ר`} />
                  <Spec icon={<Building2 className="h-4 w-4" />} label="קומה" value={`${property.floor}/${property.totalFloors}`} />
                  <Spec
                    icon={<MapPin className="h-4 w-4" />}
                    label="עיר"
                    value={getCityLabel(property.city)}
                  />
                </div>

                {/* Features */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {property.mamad && <FeatureBadge icon={<Shield className="h-3.5 w-3.5" />} label="ממ״ד" />}
                  {property.balcony && <FeatureBadge icon={<Sun className="h-3.5 w-3.5" />} label="מרפסת" />}
                  {property.parking && <FeatureBadge icon={<Car className="h-3.5 w-3.5" />} label="חניה" />}
                </div>
              </motion.div>
            </div>

            {/* Inquiry sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <InquiryForm propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </section>

      {/* Related properties */}
      {related.length > 0 && (
        <section className="border-t border-white/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 font-display text-2xl font-bold text-white">
              נכסים נוספים ב{getCityLabel(property.city)}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      {isEditOpen && editId ? (
        <PropertyEditModal
          propertyId={editId}
          open
          onClose={handleCloseEdit}
        />
      ) : null}
    </>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel rounded-xl p-4 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
        {icon}
      </div>
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm text-gold-300">
      {icon}
      {label}
    </span>
  );
}
