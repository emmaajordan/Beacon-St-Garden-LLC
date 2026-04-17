"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState, RefObject } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { Loader2, ArrowLeft, BadgeInfo } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

// Hover Information:
// Edit descriptions here to update
const sunBlurb = `Full sun: Plants need at least 6 hours of direct sun daily \n
  Part sun: Plants thrive with between 3 and 6 hours of direct sun per day \n
  Part shade: Plants require between 3 and 6 hours of sun per day, but need protection from intense mid-day sun \n
  Full shade: Plants require less than 3 hours of direct sun per day`;

const lightBlurb = `Bright Direct: 4 or more hours of direct sunlight \n
  Bright Indirect: indirect sunlight for most of the day \n
  Medium: 6-8ft away from light source \n 
  Low: 8-10 ft from a light source`;

const waterBlurb = `In general, water plants when the top 1-2in of soil is dry`;

const blurbStyle =
  "absolute bottom-10 right-0 text-xs whitespace-pre-line max-w-md p-2 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md z-10";

function ProductPageContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showSun, setShowSun] = useState(false);
  const [showLight, setShowLight] = useState(false);
  const [siblings, setSiblings] = useState<any[]>([]);

  const [activeImage, setActiveImage] = useState(0);

  const [showWater, setShowWater] = useState(false);

  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === id);
  const quantity = cartItem?.quantity ?? 0;

  const handleReserve = () =>
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
  const handleIncrease = () => updateQuantity(product.id, quantity + 1);
  const handleDecrease = () => updateQuantity(product.id, quantity - 1);

  const isAvailable =
    product?.availability === "Ready Now" && product?.stock > 0;
  const displayAvailability =
    product?.stock === 0 ? "Out of Stock" : product?.availability;

  const backHref = `/shop?${searchParams.toString()}`;

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);
      else {
        setProduct(data);
        if (data?.group_id) {
          const { data: sibs } = await supabase
            .from("products")
            .select("id, name, image_url, availability, stock")
            .eq("group_id", data.group_id)
            .eq("showing", true)
            .order("name");
          setSiblings(sibs ?? []);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--header)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--teal)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--header)] flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-[var(--text)]">Product not found.</p>
        <Link href="/shop" className="text-[var(--rust)] hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--header)]">
      <div className="mx-auto px-8 py-10 max-w-4xl">
        {/* back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-[var(--input-border)] hover:text-[var(--rust)] transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          Back to Shop
        </Link>

        {/* mobile only*/}
        <div className="sm:hidden mb-4">
          <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-2">
            {Array.isArray(product.category)
              ? product.category.join(" · ")
              : (product.category ?? "From the Garden")}
          </p>
          <h1 className="text-3xl font-semibold text-[var(--text)] mb-2">
            {product.name}
          </h1>
        </div>

        {/* top section */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-start mb-12">
          {/* image */}
          <div className="w-3/4 mx-auto sm:mx-0 sm:w-1/2 flex-shrink-0">
            {(() => {
              const urls = (
                Array.isArray(product.image_urls) &&
                product.image_urls.length > 0
                  ? product.image_urls
                  : product.image_url
                    ? [product.image_url]
                    : []
              ) as string[];
              const src = urls[activeImage] ?? null;
              return (
                <>
                  <div className="relative aspect-square rounded-sm overflow-hidden bg-[var(--card-border)] mb-3">
                    {src ? (
                      <Image
                        src={src}
                        alt={product.name}
                        fill
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDZDRkNDIi8+PC9zdmc+"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src="/no-image.png"
                          alt="No Item"
                          width={100}
                          height={100}
                          className="opacity-40"
                        />
                      </div>
                    )}
                  </div>
                  {urls.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {urls.map((url, i) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          className={`relative w-14 h-14 rounded-sm overflow-hidden border-2 transition-colors flex-shrink-0 ${
                            activeImage === i
                              ? "border-[var(--teal)]"
                              : "border-transparent hover:border-[var(--input-border)]"
                          }`}
                        >
                          <Image
                            src={url}
                            alt={`View ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* right side */}
          <div className="flex-1 w-full pt-0 sm:pt-2">
            {/* category + name — desktop only */}
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-2">
                {Array.isArray(product.category)
                  ? product.category.join(" · ")
                  : (product.category ?? "From the Garden")}
              </p>
              <h1 className="text-4xl font-semibold text-[var(--text)] mb-3">
                {product.name}
              </h1>
            </div>

            {/* availability */}
            <span
              className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-5 ${
                product.availability === "Ready Now" && product.stock > 0
                  ? "bg-[var(--teal)] text-white"
                  : "bg-[var(--disabled-bg)] text-[var(--disabled-text)]"
              }`}
            >
              {displayAvailability}
            </span>

            {/* divider */}
            <div className="h-px w-full bg-[var(--card-border)] mb-5" />

            {/* description */}
            {product.description && (
              <p className="text-sm text-[var(--text)] leading-relaxed mb-6 italic">
                {product.description}
              </p>
            )}

            {/* variant chips */}
            {siblings.length > 1 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-2">
                  Varieties
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {siblings.map((sib) => {
                    const isCurrent = sib.id === id;
                    const unavailable =
                      sib.stock === 0 || sib.availability !== "Ready Now";
                    return (
                      <Link
                        key={sib.id}
                        href={`/shop/${sib.id}?${searchParams.toString()}`}
                        className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-xs transition-colors ${
                          isCurrent
                            ? "border-[var(--text)] bg-[var(--text)] text-[var(--header)]"
                            : unavailable
                              ? "border-[var(--card-border)] text-[var(--input-border)] opacity-50 hover:border-[var(--text)] hover:opacity-75"
                              : "border-[var(--card-border)] text-[var(--text)] hover:border-[var(--text)]"
                        }`}
                      >
                        <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-[var(--card-border)]">
                          {sib.image_url && (
                            <Image
                              src={sib.image_url}
                              alt={sib.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span>{sib.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* price */}
            <p className="text-3xl font-semibold text-[var(--text)] mb-1">
              {product.price > 0 ? (
                <>
                  {`$${product.price.toFixed(2)}`}{" "}
                  <span className="text-sm font-normal">each</span>
                </>
              ) : (
                <span className="text-base text-[var(--input-border)]">
                  Price TBD
                </span>
              )}
            </p>

            {/* stock */}
            <p className="text-xs text-[var(--input-border)] mb-5">
              {product.stock > 0
                ? `${product.stock} available`
                : "None available"}
            </p>

            {/* cart controls */}
            {isAvailable ? (
              quantity === 0 ? (
                <button
                  onClick={handleReserve}
                  className="w-full bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white py-3 px-4 rounded-sm transition-colors font-medium"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrease}
                    className="w-10 h-10 bg-[var(--teal)] hover:bg-[var(--teal-hover)] rounded-sm flex items-center justify-center text-xl font-bold text-white transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-lg text-[var(--text)]">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= product.stock}
                    className={`w-10 h-10 rounded-sm flex items-center justify-center text-xl font-bold transition-colors ${
                      quantity >= product.stock
                        ? "bg-[var(--button-gray)] text-white cursor-not-allowed opacity-50"
                        : "bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white"
                    }`}
                  >
                    +
                  </button>
                </div>
              )
            ) : (
              <button
                disabled
                className="w-full py-3 px-4 rounded-sm font-medium cursor-not-allowed bg-[var(--disabled-bg)] text-[var(--disabled-text)] border border-[var(--card-border)]"
              >
                {displayAvailability}
              </button>
            )}
          </div>
        </div>

        {/* decorative divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-[var(--card-border)]" />
          <span className="text-[var(--input-border)] text-sm tracking-widest uppercase text-xs">
            Care & Details
          </span>
          <div className="h-px flex-1 bg-[var(--card-border)]" />
        </div>

        {/* care info */}
        {(product.sun ||
          product.light ||
          product.watering ||
          product.soil?.length ||
          product.ph_min ||
          product.ph_max ||
          product.spacing ||
          product.height ||
          product.life_span) && (
          <div className="mb-10">
            {product.life_span && (
              <div className="flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Life Span
                </span>
                <span className="text-sm text-[var(--text)]">
                  {product.life_span}
                </span>
              </div>
            )}
            {product.sun && (
              <div className="relative flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Sun (Outdoors)
                </span>
                <span className="flex gap-2 items-center text-sm text-[var(--text)]">
                  {product.sun}
                  <div
                    onMouseEnter={() => setShowSun(true)}
                    onMouseLeave={() => setShowSun(false)}
                  >
                    <BadgeInfo size={16} color="var(--input-border)" />
                  </div>
                </span>
                {showSun && (
                  <div className={blurbStyle}>
                    <p>{sunBlurb}</p>
                  </div>
                )}
              </div>
            )}
            {product.light && (
              <div className="relative flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Light (Indoors)
                </span>
                <span className="flex gap-2 items-center text-sm text-[var(--text)]">
                  {product.light}
                  <div
                    onMouseEnter={() => setShowLight(true)}
                    onMouseLeave={() => setShowLight(false)}
                  >
                    <BadgeInfo size={16} color="var(--input-border)" />
                  </div>
                </span>
                {showLight && (
                  <div className={blurbStyle}>
                    <p>{lightBlurb}</p>
                  </div>
                )}
              </div>
            )}
            {product.watering && (
              <div className="relative flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Watering
                </span>
                <span className="flex gap-2 items-center text-sm text-[var(--text)]">
                  {product.watering}
                  <div
                    onMouseEnter={() => setShowWater(true)}
                    onMouseLeave={() => setShowWater(false)}
                  >
                    <BadgeInfo size={16} color="var(--input-border)" />
                  </div>
                </span>
                {showWater && (
                  <div className={blurbStyle}>
                    <p>{waterBlurb}</p>
                  </div>
                )}
              </div>
            )}
            {product.soil && product.soil.length > 0 && (
              <div className="flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Soil
                </span>
                <span className="text-sm text-[var(--text)]">
                  {product.soil.join(", ")}
                </span>
              </div>
            )}
            {(product.ph_min || product.ph_max) && (
              <div className="flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  pH Range
                </span>
                <span className="text-sm text-[var(--text)]">
                  {product.ph_min && product.ph_max
                    ? `${product.ph_min} – ${product.ph_max}`
                    : (product.ph_min ?? product.ph_max)}
                </span>
              </div>
            )}
            {product.spacing && (
              <div className="flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Spacing
                </span>
                <span className="text-sm text-[var(--text)]">
                  {product.spacing}
                </span>
              </div>
            )}
            {product.height && (
              <div className="flex items-baseline justify-between py-3 border-b border-dashed border-[var(--card-border)]">
                <span className="text-xs uppercase tracking-widest text-[var(--input-border)]">
                  Height
                </span>
                <span className="text-sm text-[var(--text)]">
                  {product.height}
                </span>
              </div>
            )}
          </div>
        )}

        {/* care notes */}
        {product.care_notes && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-3">
              Care Notes
            </p>
            <p className="text-sm text-[var(--text)] leading-relaxed">
              {product.care_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--header)] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[var(--teal)]" />
        </div>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}
