"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  availability: "Ready Now" | "Coming Soon" | "Out of Stock";
  stock: number;
  description?: string;
  category?: string;
  sun?: string;
  light?: string;
  watering?: string;
  soil?: string[];
  ph_min?: number;
  ph_max?: number;
  spacing?: string;
  height?: string;
  life_span?: string;
  care_notes?: string;
  quantity: number;
  onClose: () => void;
  onReserve: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function ProductCard({
  id,
  name,
  price,
  image_url,
  availability,
  stock,
  description,
  category,
  sun,
  light,
  watering,
  soil,
  ph_min,
  ph_max,
  spacing,
  height,
  life_span,
  care_notes,
}: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === id);
  const quantity = cartItem?.quantity ?? 0;
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleReserve = () => addItem({ id, name, price, image_url, stock });
  const handleIncrease = () => updateQuantity(id, quantity + 1);
  const handleDecrease = () => updateQuantity(id, quantity - 1);

  // set to "Out of Stock" if stock is 0
  const isAvailable = availability === "Ready Now" && stock > 0;
  const displayAvailability =
    availability === "Coming Soon"
      ? "Coming Soon"
      : stock === 0
        ? "Out of Stock"
        : availability;

  return (
    <>
      <div
        className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
        onClick={() =>
          router.push(
            `/shop/${id}?${new URLSearchParams(window.location.search)}`,
          )
        }
      >
        {/* image */}
        <div className="relative h-48 bg-[var(--card-border)] overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton-shimmer z-10" />
          )}
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className={`object-cover group-hover:scale-105 transition-all duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Image
                src="/no-image.png"
                alt="No Item"
                width={80}
                height={80}
                className="opacity-40"
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          )}
        </div>

        {/* product info */}
        <div className="p-3 text-center">
          <h3 className="text-base font-semibold text-[var(--text)] mb-1 line-clamp-1">
            {name}
          </h3>

          <p className="text-lg font-medium text-[var(--text)] mb-3 h-7">
            {price > 0 ? (
              <>
                ${price.toFixed(2)}{" "}
                <span className="text-xs font-normal">each</span>
              </>
            ) : (
              <span className="invisible">placeholder</span>
            )}
          </p>

          {/*stock warning*/}
          {/*TO CHANGE WHEN WARNING SHOWS, CHANGE THE NUMBER AFTER STOCK <= BELOW*/}
          <div className="h-4 mb-1">
            {stock != 0 && stock <= 5 && (
              <p className="text-xs text-[var(--rust)]">Only {stock} left!</p>
            )}
          </div>

          {/* button */}
          {isAvailable ? (
            quantity === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReserve();
                }}
                className="w-full bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white py-1.5 px-3 rounded-md transition-colors font-medium text-sm"
              >
                Add to Cart
              </button>
            ) : (
              <div
                className="flex items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDecrease}
                  className="w-8 h-8 bg-[var(--teal)] hover:bg-[var(--teal-hover)] rounded-md flex items-center justify-center text-xl font-bold text-white transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-base text-[var(--text)]">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= stock} // disabled at max
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xl font-bold transition-colors ${
                    quantity >= stock
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
              className="w-full py-1.5 px-3 rounded-md font-medium cursor-not-allowed text-sm bg-[var(--disabled-bg)] text-[var(--disabled-text)] border border-[var(--card-border)]"
            >
              {displayAvailability}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
