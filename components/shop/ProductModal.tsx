"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ProductModalProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  availability: "Ready Now" | "Coming Soon" | "Out of Stock";
  stock: number;
  quantity: number;
  onClose: () => void;
  onReserve: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  sunlight?: string;
  water?: string;
  careNotes?: string;
  soil?: string;
  description?: string;
}

export default function ProductModal({
  name,
  price,
  image_url,
  availability,
  stock,
  quantity,
  onClose,
  onReserve,
  onIncrease,
  onDecrease,
  sunlight,
  water,
  careNotes,
  soil,
  description,
}: ProductModalProps) {
  const isAvailable = availability === "Ready Now" && stock > 0;
  const displayAvailability = stock === 0 ? "Out of Stock" : availability;

  // close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* modal card */}
      <div
        className="relative bg-[var(--header)] rounded-lg shadow-xl border border-[var(--card-border)] w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing when clicking inside
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-border)] transition-colors text-[var(--text)]"
        >
          <X size={16} />
        </button>

        {/* image */}
        <div className="relative h-64 bg-[var(--card-border)]">
          {image_url ? (
            <Image src={image_url} alt={name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/no_item.svg"
                alt="No Item"
                width={100}
                height={100}
                className="opacity-40"
              />
            </div>
          )}

          {/* availability badge overlaid on image */}
          <span
            className={`absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${
              availability === "Ready Now" && stock > 0
                ? "bg-[var(--teal)] text-white"
                : "bg-[var(--disabled-bg)] text-[var(--disabled-text)]"
            }`}
          >
            {displayAvailability}
          </span>
        </div>

        {/* content */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-1">
            {name}
          </h2>

          <p className="text-xl font-medium text-[var(--text)] mb-4">
            {price > 0 ? (
              <>
                ${price.toFixed(2)}{" "}
                <span className="text-sm font-normal">each</span>
              </>
            ) : (
              <span className="text-sm text-[var(--input-border)]">
                Price TBD
              </span>
            )}
          </p>

          {/* divider */}
          <div className="border-t border-[var(--card-border)] mb-4" />
            {/* description */}
            {description && (
              <p className="text-sm text-[var(--input-border)] italic mb-4">
                {description}
              </p>
            )}


          {/* care info*/}
          {(sunlight || water || soil || careNotes) && (
            <div className="mb-4 space-y-2">
              {sunlight && (
                <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <span className="text-base">☀︎</span>
                  <span className="font-medium px-0.75">Sunlight:</span>
                  <span>{sunlight}</span>
                </div>
              )}
              {water && (
                <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <span className="text-base">🌨</span>
                  <span className="font-medium">Water:</span>
                  <span>{water}</span>
                </div>
              )}
              {soil && (
                <div className="flex items-center gap-2 text-sm text-[var(--text)]">

                  <Image src='/sprout_info.png' alt='soil icon' width={15} height={15}/>
                  <span className="font-medium px-0.5">Soil:</span>
                  <span>{soil}</span>
                </div>
              )}
              {careNotes && (
                <div
                  className={`pt-1 text-sm text-[var(--text)] ${!sunlight && !water ? "" : "border-t border-[var(--card-border)] pt-4 "}`}
                >
                  <span className="font-medium">Care notes: </span>
                  {careNotes}
                </div>
              )}
            </div>
          )}

          {/* stock info */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-[var(--input-border)]">
              {stock > 0 ? `${stock} available` : "None available"}
            </span>
          </div>

          {/* reserve / quantity controls */}
          {isAvailable ? (
            quantity === 0 ? (
              <button
                onClick={onReserve}
                className="w-full bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white py-2.5 px-3 rounded-md transition-colors font-medium"
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onDecrease}
                  className="w-10 h-10 bg-[var(--button-gray)] hover:bg-[var(--button-gray-hover)] rounded-md flex items-center justify-center text-xl font-bold text-white transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-lg text-[var(--text)]">
                  {quantity}
                </span>
                <button
                  onClick={onIncrease}
                  disabled={quantity >= stock}
                  className={`w-10 h-10 rounded-md flex items-center justify-center text-xl font-bold transition-colors ${
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
              className="w-full py-2.5 px-3 rounded-md font-medium cursor-not-allowed bg-[var(--disabled-bg)] text-[var(--disabled-text)] border border-[var(--card-border)]"
            >
              {displayAvailability}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
