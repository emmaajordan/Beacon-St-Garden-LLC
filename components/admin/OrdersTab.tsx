"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  X,
  Search,
  Trash2,
} from "lucide-react";

type ReservationItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  is_custom: boolean;
};

type Reservation = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  order_notes: string | null;
  availability: Record<string, string> | null;
  status: "unconfirmed" | "confirmed" | "completed";
  proposed_pickup: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  final_cost: number | null;
  reservation_items: ReservationItem[];
};

const labelClass =
  "block text-xs uppercase tracking-widest text-[var(--input-border)] mb-1";
const inputClass =
  "w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]";
const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 21; h++) {
  for (const m of [0, 30]) {
    if (h === 21 && m === 30) break;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    TIME_SLOTS.push(`${hour12}:${m === 0 ? "00" : "30"} ${ampm}`);
  }
}

function parsePickupString(s: string | null) {
  if (!s) return { date: "", start: "", end: "" };
  const [datePart, timePart] = s.split(" · ");
  const [start, end] = (timePart ?? "").split(" – ");
  return { date: datePart ?? "", start: start ?? "", end: end ?? "" };
}

function buildPickupString(date: string, start: string, end: string) {
  if (!date && !start && !end) return "";
  const datePart = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      })
    : "";
  const timePart = start && end ? `${start} – ${end}` : start || end || "";
  if (datePart && timePart) return `${datePart} · ${timePart}`;
  return datePart || timePart;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AddItemRow({
  reservationId,
  onAdd,
}: {
  reservationId: string;
  onAdd: () => void;
}) {
  const supabase = createClient();
  const [mode, setMode] = useState<"search" | "custom">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [adding, setAdding] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const { data } = await supabase
      .from("products")
      .select("id, name, price")
      .ilike("name", `%${q}%`)
      .limit(5);
    setResults(data || []);
  };

  const handleAddProduct = async (product: any) => {
    setAdding(true);
    await supabase.from("reservation_items").insert({
      reservation_id: reservationId,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      is_custom: false,
    });
    setQuery("");
    setResults([]);
    onAdd();
    setAdding(false);
  };

  const handleAddCustom = async () => {
    if (!customName || !customPrice) return;
    setAdding(true);
    await supabase.from("reservation_items").insert({
      reservation_id: reservationId,
      product_id: null,
      product_name: customName,
      price: parseFloat(customPrice),
      quantity: parseInt(customQty) || 1,
      is_custom: true,
    });
    setCustomName("");
    setCustomPrice("");
    setCustomQty("1");
    onAdd();
    setAdding(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-[var(--card-border)]">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("search")}
          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            mode === "search"
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)]"
          }`}
        >
          Search Products
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            mode === "custom"
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)]"
          }`}
        >
          Custom Item
        </button>
      </div>

      {mode === "search" ? (
        <div className="relative">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--input-border)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-8 pr-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-[var(--header)] border border-[var(--card-border)] rounded-md shadow-md z-10 mt-1">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddProduct(p)}
                  disabled={adding}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--card-bg)] transition-colors"
                >
                  <span>{p.name}</span>
                  <span className="text-[var(--input-border)]">
                    ${parseFloat(p.price).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>Item Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Extra seedlings"
              className={inputClass}
            />
          </div>
          <div className="w-20">
            <label className={labelClass}>Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div className="w-16">
            <label className={labelClass}>Qty</label>
            <input
              type="number"
              min="1"
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleAddCustom}
            disabled={adding || !customName || !customPrice}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              adding || !customName || !customPrice
                ? "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                : "bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white"
            }`}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function ReservationRow({
  reservation,
  onUpdate,
}: {
  reservation: Reservation;
  onUpdate: () => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const parsed = parsePickupString(reservation.proposed_pickup);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date(parsed.date);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
  });
  const [pickupStart, setPickupStart] = useState(parsed.start);
  const [pickupEnd, setPickupEnd] = useState(parsed.end);
  const pickupTime = buildPickupString(pickupDate, pickupStart, pickupEnd);
  const [finalCost, setFinalCost] = useState<string>(
    reservation.final_cost?.toString() ?? "",
  );
  const [items, setItems] = useState<ReservationItem[]>(
    reservation.reservation_items,
  );
  const [showAddItem, setShowAddItem] = useState(false);

  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const refreshItems = async () => {
    const { data } = await supabase
      .from("reservation_items")
      .select("*")
      .eq("reservation_id", reservation.id);
    if (data) {
      setItems(data);
      setFinalCost(
        data.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2),
      );
    }
    onUpdate();
  };

  const handleRemoveItem = async (itemId: string) => {
    await supabase.from("reservation_items").delete().eq("id", itemId);
    refreshItems();
  };

  const handleUpdateQuantity = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    await supabase
      .from("reservation_items")
      .update({ quantity: qty })
      .eq("id", itemId);
    refreshItems();
  };

  const handleConfirm = async () => {
    if (!pickupTime) {
      setError("Please set a pickup time first.");
      console.log("sending to:", reservation.email);
      return;
    }
    console.log("sending to:", reservation.email);
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        status: "confirmed",
        proposed_pickup: pickupTime,
        confirmed_at: new Date().toISOString(),
        final_cost: parseFloat(finalCost) || calculatedTotal,
      })
      .eq("id", reservation.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // send confirmation email
    if (reservation.email) {
      await fetch("/api/send-pickup-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reservation.name,
          email: reservation.email,
          pickupTime,
          items,
          finalCost: parseFloat(finalCost) || calculatedTotal,
        }),
      });
    }

    onUpdate();
    setSaving(false);
  };

  const handleSaveConfirmed = async () => {
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        proposed_pickup: pickupTime,
        final_cost: parseFloat(finalCost) || calculatedTotal,
      })
      .eq("id", reservation.id);

    if (updateError) setError(updateError.message);
    onUpdate();
    setSaving(false);
  };

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        final_cost: parseFloat(finalCost) || calculatedTotal,
      })
      .eq("id", reservation.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // send thank you email
    if (reservation.email) {
      await fetch("/api/send-pickup-thanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reservation.name,
          email: reservation.email,
          items,
          finalCost: parseFloat(finalCost) || calculatedTotal,
        }),
      });
    }

    onUpdate();
    setSaving(false);
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    await supabase.from("reservations").delete().eq("id", reservation.id);
    onUpdate();
  };

  const collapseLabel = () => {
    if (reservation.status === "unconfirmed")
      return `Submitted ${formatDateTime(reservation.created_at)}`;
    if (reservation.status === "confirmed")
      return `Pickup: ${reservation.proposed_pickup || "—"}`;
    if (reservation.status === "completed")
      return `Completed ${formatDateTime(reservation.completed_at)}`;
  };

  return (
    <div className="border border-[var(--card-border)] rounded-lg overflow-hidden">
      {/* collapsed row */}
      <div
        className="flex items-center gap-4 p-4 bg-[var(--card-bg)] cursor-pointer hover:bg-[var(--card-border)] transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text)] text-sm truncate">
            {reservation.name}
          </p>
          <p className="text-xs text-[var(--input-border)]">
            {collapseLabel()}
          </p>
        </div>
        <div className="hidden sm:block text-xs text-[var(--input-border)] flex-shrink-0">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
        <div className="hidden sm:block text-sm text-[var(--text)] flex-shrink-0">
          ${(parseFloat(finalCost) || calculatedTotal).toFixed(2)}
        </div>
        <div className="flex-shrink-0 text-[var(--input-border)]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* expanded */}
      {expanded && (
        <div className="p-5 bg-[var(--header)] border-t border-[var(--card-border)]">
          {/* customer info */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-3">
              Customer
            </p>
            <div className="space-y-1">
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--input-border)]">Name: </span>
                {reservation.name}
              </p>
              <p className="text-sm text-[var(--text)]">
                <span className="text-[var(--input-border)]">Email: </span>
                {reservation.email ?? "—"}
              </p>
              {reservation.order_notes && (
                <p className="text-sm text-[var(--text)]">
                  <span className="text-[var(--input-border)]">Notes: </span>
                  {reservation.order_notes}
                </p>
              )}
            </div>
          </div>

          {/* availability */}
          {reservation.availability &&
            Object.keys(reservation.availability).length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-3">
                  Their Availability
                </p>
                <div className="space-y-1">
                  {Object.entries(reservation.availability).map(
                    ([day, time]) => (
                      <div key={day} className="flex gap-4 text-sm">
                        <span className="text-[var(--input-border)] w-10">
                          {day}
                        </span>
                        <span className="text-[var(--text)]">
                          {time || "Any time"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* items */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-3">
              Items
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {reservation.status !== "completed" && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[var(--input-border)] hover:text-[var(--rust)] transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <span className="flex-1 text-sm text-[var(--text)]">
                    {item.product_name}
                  </span>
                  {reservation.status !== "completed" ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 bg-[var(--button-gray)] hover:bg-[var(--button-gray-hover)] rounded flex items-center justify-center text-xs font-bold text-white transition-colors"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-[var(--text)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 bg-[var(--teal)] hover:bg-[var(--teal-hover)] rounded flex items-center justify-center text-xs font-bold text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--input-border)]">
                      ×{item.quantity}
                    </span>
                  )}
                  <span className="text-sm text-[var(--text)] w-16 text-right flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* add item */}
            {reservation.status !== "completed" && (
              <div>
                {!showAddItem ? (
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="flex items-center gap-1.5 mt-3 text-xs text-[var(--input-border)] hover:text-[var(--teal)] transition-colors"
                  >
                    <Plus size={13} />
                    Add Item
                  </button>
                ) : (
                  <div>
                    <AddItemRow
                      reservationId={reservation.id}
                      onAdd={() => {
                        refreshItems();
                        setShowAddItem(false);
                      }}
                    />
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="mt-2 text-xs text-[var(--input-border)] hover:text-[var(--rust)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* total */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--card-border)]">
              <span className="text-sm font-medium text-[var(--text)]">
                Total
              </span>
              <div className="flex items-center gap-2">
                {reservation.status !== "completed" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--input-border)]">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={finalCost}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+(\.\d{0,2})?$/.test(val)) {
                          setFinalCost(val);
                        }
                      }}
                      className="w-20 px-2 py-1 bg-[var(--header)] border border-[var(--input-border)] rounded-md text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
                    />
                    <button
                      onClick={() => setFinalCost(calculatedTotal.toFixed(2))}
                      className="text-xs text-[var(--input-border)] hover:text-[var(--teal)] transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-[var(--text)]">
                    ${(parseFloat(finalCost) || calculatedTotal).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 text-sm text-[var(--input-border)] hover:text-[var(--rust)] transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Reservation
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-[var(--text)]">Are you sure?</p>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white text-sm rounded-md transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 bg-[var(--card-bg)] hover:bg-[var(--card-border)] text-[var(--text)] text-sm rounded-md transition-colors border border-[var(--card-border)]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* pickup time */}
          {reservation.status !== "completed" && (
            <div className="mb-5">
              <label className={labelClass}>Proposed Pickup Time</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
                />
                <select
                  value={pickupStart}
                  onChange={(e) => setPickupStart(e.target.value)}
                  className="flex-1 min-w-[110px] px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
                >
                  <option value="">Start time</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-sm text-[var(--input-border)]">–</span>
                <select
                  value={pickupEnd}
                  onChange={(e) => setPickupEnd(e.target.value)}
                  className="flex-1 min-w-[110px] px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
                >
                  <option value="">End time</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {pickupTime && (
                <p className="mt-1.5 text-xs text-[var(--input-border)]">{pickupTime}</p>
              )}
            </div>
          )}

          {reservation.status === "completed" &&
            reservation.proposed_pickup && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-1">
                  Pickup Time
                </p>
                <p className="text-sm text-[var(--text)]">
                  {reservation.proposed_pickup}
                </p>
              </div>
            )}

          {/* error */}
          {error && <p className="text-sm text-[var(--rust)] mb-3">{error}</p>}

          {/* actions */}
          {reservation.status === "unconfirmed" && (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                saving
                  ? "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                  : "bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white"
              }`}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Confirming..." : "Mark as Confirmed"}
            </button>
          )}

          {reservation.status === "confirmed" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveConfirmed}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  saving
                    ? "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                    : "bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white"
                }`}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleComplete}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  saving
                    ? "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                    : "bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white"
                }`}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Completing..." : "Mark as Completed"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReservationSection({
  title,
  reservations,
  onUpdate,
}: {
  title: string;
  reservations: Reservation[];
  onUpdate: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-8">
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex items-center gap-2 mb-4 w-full text-left"
      >
        <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-xs text-[var(--input-border)] bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-0.5 rounded-full">
          {reservations.length}
        </span>
        <div className="flex-1 h-px bg-[var(--card-border)] ml-2" />
        <span className="text-[var(--input-border)]">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {reservations.length === 0 ? (
            <p className="text-sm text-[var(--input-border)] py-4 text-center">
              No {title.toLowerCase()} reservations.
            </p>
          ) : (
            reservations.map((r) => (
              <ReservationRow key={r.id} reservation={r} onUpdate={onUpdate} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersTab() {
  const supabase = createClient();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*, reservation_items(*)")
      .order("created_at", { ascending: false });

    if (!error) setReservations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const unconfirmed = reservations
    .filter((r) => r.status === "unconfirmed")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const parsePickupDate = (s: string | null) => {
    if (!s) return 0;
    const datePart = s.split(" · ")[0];
    const d = new Date(datePart);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const confirmed = reservations
    .filter((r) => r.status === "confirmed")
    .sort(
      (a, b) => parsePickupDate(a.proposed_pickup) - parsePickupDate(b.proposed_pickup));

  const completed = reservations
    .filter((r) => r.status === "completed")
    .sort(
      (a, b) => parsePickupDate(a.proposed_pickup) - parsePickupDate(b.proposed_pickup));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={28} className="animate-spin text-[var(--teal)]" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text)] mb-8">Orders</h2>
      <ReservationSection
        title="Unconfirmed"
        reservations={unconfirmed}
        onUpdate={fetchReservations}
      />
      <ReservationSection
        title="Confirmed"
        reservations={confirmed}
        onUpdate={fetchReservations}
      />
      <ReservationSection
        title="Completed"
        reservations={completed}
        onUpdate={fetchReservations}
      />
    </div>
  );
}
