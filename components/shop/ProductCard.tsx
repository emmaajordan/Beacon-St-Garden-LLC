"use client";

import Image from "next/image";
import { useState } from "react";
import ProductModal from "./ProductModal";
import { useCartStore } from "@/lib/store/cartStore";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  availability: "Ready Now" | "Coming Soon" | "Out of Stock";
  stock: number;
  sunlight?: string;
  water?: string;
  careNotes?: string;
  soil?: string;
  description?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  image_url,
  availability,
  stock,
  sunlight,
  water,
  careNotes,
  soil,
  description,
}: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === id);
  const quantity = cartItem?.quantity ?? 0;
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        onClick={() => setIsModalOpen(true)}
      >
        {/* image */}
        <div className="relative h-48 bg-[var(--card-border)]">
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/no_item.svg"
                alt="No Item"
                width={80}
                height={80}
                className="opacity-40"
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
                  className="w-8 h-8 bg-[var(--button-gray)] hover:bg-[var(--button-gray-hover)] rounded-md flex items-center justify-center text-xl font-bold text-white transition-colors"
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

      {isModalOpen && (
        <ProductModal
          id={id}
          name={name}
          price={price}
          image_url={image_url}
          availability={availability}
          stock={stock}
          quantity={quantity}
          onClose={() => setIsModalOpen(false)}
          onReserve={handleReserve}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          sunlight={sunlight}
          water={water}
          careNotes={careNotes}
          soil={soil}
          description={description}
        />
      )}
    </>
  );
}
