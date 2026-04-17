"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, Info, Snail, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/supabase";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CartPage() {
  const [dayTimes, setDayTimes] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "" });
  const [orderNotes, setOrderNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  const selectedDays = Object.keys(dayTimes);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const canSubmit =
    form.name &&
    form.email &&
    emailRegex.test(form.email) &&
    cartItems.length > 0;

  const toggleDay = (day: string) => {
    setDayTimes((prev) => {
      if (day in prev) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: "" };
    });
  };

  const updateDayTime = (day: string, value: string) => {
    setDayTimes((prev) => ({ ...prev, [day]: value }));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) updateQuantity(id, item.quantity + delta);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + ((item.price ?? 0) * item.quantity),
    0,
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stockError, setStockError] = useState<string[]>([]);

  const handleSubmit = async () => {

    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      // build items list
      const stockItems = cartItems
        .filter((item) => item.id)
        .map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        }));
        const { data: roleCheck } = await supabase.rpc('get_my_role');
      console.log('my role:', roleCheck);
      console.log("full anon key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      // 1. save reservation + items via server-side API route (bypasses RLS issue)
      const reservationRes = await fetch("/api/create-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation: {
            name: form.name,
            email: form.email || null,
            order_notes: orderNotes || null,
            availability: dayTimes,
            status: "unconfirmed",
            final_cost: subtotal,
          },
          items: cartItems.map((item) => ({
            product_id: item.id,
            product_name: item.name,
            price: item.price ?? 0,
            quantity: item.quantity,
          })),
        }),
      });

      const reservationData = await reservationRes.json();
      if (!reservationRes.ok) throw new Error(reservationData.error);

      const reservation = { id: reservationData.id };

      // 3. now decrement stock
      const { data: stockResult, error: stockRpcError } = await supabase.rpc(
        "reserve_stock",
        { items: stockItems },
      );

      if (stockRpcError) throw new Error(stockRpcError.message);

      if (!stockResult || stockResult.success === false) {
        // stock check failed -> roll back the reservation rows
        await supabase.from("reservation_items").delete().eq("reservation_id", reservation.id);
        await supabase.from("reservations").delete().eq("id", reservation.id);

        const errors = stockResult.errors as any[];
        const messages = errors.map((e: any) => {
          if (e.available === 0) {
            return `${e.product_name} is out of stock and has been removed from your cart`;
          }
          return `Only ${e.available} of ${e.product_name} available. Your cart has been updated`;
        });

        setStockError(messages);
        setSubmitting(false);

        errors.forEach((e: any) => {
          if (e.available === 0) {
            removeItem(e.product_id);
          } else {
            updateQuantity(e.product_id, e.available);
          }
        });

        return;
      }

      // 4. send confirmation email
      if (form.email) {
        await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            items: cartItems,
            orderNotes,
            availability: dayTimes,
          }),
        });
      }

      clearCart();
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError("Something went wrong. Please try again.");
      // fire-and-forget alert email to admin
      fetch("/api/send-error-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorMessage: err.message,
          occurredAt: new Date().toISOString(),
          context: {
            customerName: form.name,
            customerEmail: form.email,
            cartItems,
            orderNotes,
            availability: dayTimes,
          },
        }),
      });
      console.error(err);
    }

    setSubmitting(false);
  };

  // empty cart state
  if (cartItems.length === 0 && !submitted && stockError.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--header)] flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-[var(--text)]">Your cart is empty.</p>
        <Link
          href="/shop"
          className="bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white px-6 py-2.5 rounded-md transition-colors font-medium"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // confirmation screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--header)] flex flex-col items-center justify-center gap-4 px-8">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-10 max-w-md w-full text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <Snail size={40} className="text-[var(--teal)]" />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-2">
            Reservation Received!
          </h2>
          <p className="text-sm text-[var(--text)] mb-1">
            Thanks, {form.name}.
          </p>
          <p className="text-sm text-[var(--text)] mb-6">
            A confirmation has been sent to you. <br /> We'll reach out to
            finalize your pickup time.
          </p>
          <Link
            href="/shop"
            className="bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white px-6 py-2.5 rounded-md transition-colors font-medium text-sm"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--header)]">
      <div className="mx-auto px-4 md:px-8 py-6 md:py-10 max-w-5xl">
        {/* page title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text)] mb-2 text-center">
          Cart
        </h1>
        <div className="border-t border-[var(--card-border)] mb-8" />

        {/* two column layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* LEFT — cart items + notice */}
          <div className="w-full md:w-80 md:flex-shrink-0 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-sm p-8 flex flex-col items-center text-center gap-4">
                <p className="text-sm text-[var(--input-border)]">
                  Your cart is empty.
                </p>
                <Link
                  href="/shop"
                  className="bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                {/* cart items */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-sm overflow-hidden">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-4 ${index !== cartItems.length - 1 ? "border-b border-[var(--card-border)]" : ""}`}
                    >
                      {/* image */}
                      <div className="relative w-16 h-14 flex-shrink-0 bg-[var(--card-border)] rounded-md overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image
                              src="/no_item.svg"
                              alt="No Item"
                              width={28}
                              height={28}
                              className="opacity-40"
                            />
                          </div>
                        )}
                      </div>

                      {/* name + price */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text)] text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--input-border)]">
                          {item.price ? `$${item.price.toFixed(2)} each` : 'Price TBD'}
                        </p>
                      </div>

                      {/* quantity adjuster */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-6 h-6 bg-[var(--button-gray)] hover:bg-[var(--button-gray-hover)] rounded flex items-center justify-center text-sm font-bold text-white transition-colors"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-[var(--text)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-6 h-6 bg-[var(--teal)] hover:bg-[var(--teal-hover)] rounded flex items-center justify-center text-sm font-bold text-white transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[var(--input-border)] hover:text-[var(--rust)] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* subtotal row */}
                  <div className="border-t border-[var(--card-border)] bg-[var(--header)]">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-semibold text-[var(--text)] text-sm">Total</span>
                      <span className="text-lg font-semibold text-[var(--text)]">
                        {cartItems.some(i => !i.price) ? `$${subtotal.toFixed(2)}*` : `$${subtotal.toFixed(2)}`}
                      </span>
                    </div>
                    {cartItems.some(i => !i.price) && (
                      <p className="text-xs italic text-[var(--input-border)] px-4 pb-3">* Prices marked TBD will be confirmed at pickup.</p>
                    )}
                  </div>
                  
                </div>

                {/* notice */}
                <div className="flex items-start gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-sm text-[var(--text)]">
                  <Info
                    size={15}
                    className="mt-0.5 flex-shrink-0 text-[var(--teal)]"
                  />
                  <p>Reservation only. Payment due at time of pickup.</p>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — form */}
          <div className="flex-1">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-sm p-6">
              {/* your information */}
              <h2 className="text-lg font-semibold text-[var(--text)] mb-5 pb-3 border-b border-[var(--card-border)]">
                Your Information
              </h2>

              <div className="space-y-4 mb-6">
                {/* name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Name <span className="text-[var(--rust)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
                    placeholder="Your name"
                  />
                </div>

                {/* email + phone */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Email <span className="text-[var(--rust)]">*</span>
                    <span className="text-xs font-normal text-[var(--input-border)] ml-1">
                      {" "}
                    </span>
                  </label>
                  <input
                    type="email"
                    pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {/* divider */}
              <div className="border-t border-[var(--card-border)] mb-5" />

              {/* pickup availability */}
              <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
                Pickup Availability
              </h2>
              <p className="text-xs text-[var(--input-border)] mb-4">
                Select the days you're available and add times for each. We'll
                reach out to finalize.
              </p>

              {/* day toggles + per-day time inputs */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Available Days
                </label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 rounded-md text-xs md:text-sm font-medium border transition-colors ${
                        selectedDays.includes(day)
                          ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                          : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* expanded time inputs per day */}
                {selectedDays.length > 0 && (
                  <div className="space-y-2">
                    {selectedDays.map((day, index) => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="w-10 text-sm font-medium text-[var(--text)] flex-shrink-0">
                          {day}
                        </span>
                        <input
                          type="text"
                          value={dayTimes[day]}
                          onChange={(e) => updateDayTime(day, e.target.value)}
                          placeholder="e.g. 11am–5pm, not 2–3pm"
                          className="flex-1 px-3 py-1.5 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* order notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Order Notes{" "}
                  <span className="text-xs font-normal text-[var(--input-border)]">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] resize-none"
                  placeholder="Any special requests or questions..."
                />
              </div>

              {/* reach out notice */}
              <div className="flex items-start gap-2 bg-[var(--header)] border border-[var(--card-border)] rounded-md px-3 py-2.5 mb-5 text-xs text-[var(--text)]">
                <Info
                  size={13}
                  className="mt-0.5 flex-shrink-0 text-[var(--teal)]"
                />
                <p>
                  We'll reach out via email to confirm your pickup time. No
                  payment is needed until pickup.
                </p>
              </div>

              {/* submit */}
              {stockError.length > 0 && (
                <div className="bg-[var(--header)] border border-[var(--rust)] rounded-md px-4 py-3 mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      {stockError.map((msg, i) => (
                        <p key={i} className="text-sm text-[var(--rust)]">
                          {msg}
                        </p>
                      ))}
                    </div>
                    <button
                      onClick={() => setStockError([])}
                      className="text-[var(--rust)] hover:opacity-70 transition-opacity flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
              {submitError && (
                <p className="text-sm text-[var(--rust)] mb-3">{submitError}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`w-full py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                  canSubmit && !submitting
                    ? "bg-[var(--rust)] hover:bg-[#a0523f] text-white"
                    : "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                }`}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Placing Reservation..." : "Place Reservation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
