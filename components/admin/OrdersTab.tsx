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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function NewOrderModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({ name: '', email: '', order_notes: '' });
  const [dayTimes, setDayTimes] = useState<Record<string, string>>({});
  const [pickupDate, setPickupDate] = useState('');
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');
  const [ items, setItems] = useState<{ product_name: string; price: string; quantity: string; product_id?: string | null; stock?: number; }[]>([]);
  const [status, setStatus] = useState<'unconfirmed' | 'confirmed' | 'completed'>('unconfirmed');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const calculatedTotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price || '0') * parseInt(i.quantity || '1'), 0
  );
  const [finalCost, setFinalCost] = useState('');
  

  const pickupTime = buildPickupString(pickupDate, pickupStart, pickupEnd);

  const toggleDay = (day: string) => {
    setDayTimes(prev => {
      if (day in prev) { const next = { ...prev }; delete next[day]; return next; }
      return { ...prev, [day]: '' };
    });
  };

  const addItemRow = () =>
    setItems(prev => [...prev, { product_name: '', price: '', quantity: '1' }]);

  const removeItemRow = (i: number) =>
    setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: string) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required.'); return; }
    const validItems = items.filter(i => i.product_name.trim());

    setSaving(true);
    setError('');

    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert({
        name: form.name,
        email: form.email || null,
        order_notes: form.order_notes || null,
        availability: Object.keys(dayTimes).length > 0 ? dayTimes : null,
        proposed_pickup: pickupTime || null,
        status,
        final_cost: parseFloat(finalCost) || calculatedTotal || null,
        confirmed_at: status === 'confirmed' || status === 'completed' ? new Date().toISOString() : null,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (resError || !reservation) {
      setError('Failed to create reservation: ' + resError?.message);
      setSaving(false);
      return;
    }

    const itemRows = validItems.map(i => ({
      reservation_id: reservation.id,
      product_id: null,
      product_name: i.product_name,
      price: parseFloat(i.price) || 0,
      quantity: parseInt(i.quantity) || 1,
      is_custom: true,
    }));

    const { error: itemsError } = await supabase
      .from('reservation_items')
      .insert(itemRows);

    if (itemsError) {
      setError('Failed to add items: ' + itemsError.message);
      setSaving(false);
      return;
    }
    // deduct stock for non-custom items
    for (const item of validItems) {
      if (!item.product_id) continue;

      const { data: freshProduct } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (!freshProduct || freshProduct.stock < parseInt(item.quantity)) {
        setError(`Not enough stock for ${item.product_name}.`);
        setSaving(false);
        return;
      }

      await supabase
        .from('products')
        .update({ stock: freshProduct.stock - parseInt(item.quantity) })
        .eq('id', item.product_id)
        .eq('stock', freshProduct.stock);
    }

    if (form.email) {
      if (status === 'confirmed') {
        await fetch('/api/send-pickup-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            pickupTime: pickupTime || null,
            items: validItems.map(i => ({
              product_name: i.product_name,
              price: parseFloat(i.price || '0'),
              quantity: parseInt(i.quantity || '1'),
            })),
            finalCost: parseFloat(finalCost) || calculatedTotal,
          }),
        });
      } else if (status === 'completed') {
        await fetch('/api/send-pickup-thanks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            items: validItems.map(i => ({
              product_name: i.product_name,
              price: parseFloat(i.price || '0'),
              quantity: parseInt(i.quantity || '1'),
            })),
            finalCost: parseFloat(finalCost) || calculatedTotal,
          }),
        });
      }
    }

    onSuccess();
    onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[var(--header)] rounded-lg shadow-xl border border-[var(--card-border)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* sticky header */}
        <div className="sticky top-0 bg-[var(--header)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text)]">New Order</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-border)] transition-colors text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* customer info */}
          <div>
            <p className={labelClass}>Customer Info</p>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name <span className="text-[var(--rust)]">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  placeholder="customer@email.com"
                />
              </div>
            </div>
          </div>

          {/* divider */}
          <div className="border-t border-[var(--card-border)]" />

          {/* items */}
          <div>
            <label className={labelClass}>Items</label>
            
            {items.length > 0 && (
              <div className="space-y-2 mb-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button
                      onClick={() => removeItemRow(i)}
                      className="text-[var(--input-border)] hover:text-[var(--rust)] transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                    <span className="flex-1 text-sm text-[var(--text)]">{item.product_name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (parseInt(item.quantity) <= 1) {
                            removeItemRow(i);
                          } else {
                            updateItem(i, 'quantity', String(parseInt(item.quantity || '1') - 1));
                          }}}
                        className="w-6 h-6 bg-[var(--teal)] hover:bg-[var(--teal-hover)] rounded flex items-center justify-center text-xs font-bold text-white transition-colors"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-[var(--text)]">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const max = item.stock ?? Infinity;
                          updateItem(i, 'quantity', String(Math.min(parseInt(item.quantity || '1') + 1, max)));
                        }}
                        disabled={item.stock !== undefined && parseInt(item.quantity) >= item.stock}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                          item.stock !== undefined && parseInt(item.quantity) >= item.stock
                            ? "bg-[var(--button-gray)] text-white cursor-not-allowed opacity-50"
                            : "bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-[var(--text)] w-16 text-right flex-shrink-0">
                      ${(parseFloat(item.price || '0') * parseInt(item.quantity || '1')).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* add item row — reuses same search/custom pattern */}
            <AddItemRow
              reservationId="__new__"
              onAdd={() => {}}
              onAddItem={(item) =>
                setItems(prev => {
                  const existing = prev.findIndex(p => p.product_id && p.product_id === item.product_id);
                  if (existing !== -1) {
                    return prev.map((p, idx) => {
                      if (idx !== existing) return p;
                      const newQty = Math.min(parseInt(p.quantity) + 1, item.stock ?? Infinity);
                      return { ...p, quantity: String(newQty) };
                    });
                  }
                  return [...prev, {
                    product_name: item.product_name,
                    price: String(item.price),
                    quantity: String(item.quantity),
                    product_id: item.product_id ?? null,
                    stock: item.stock,
                  }];
                })
              }
            />
          </div>

          {/* divider */}
          <div className="border-t border-[var(--card-border)]" />

          {/* proposed pickup */}
          <div>
            <label className={labelClass}>Proposed Pickup Time</label>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="date"
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                className="flex-1 min-w-[140px] px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
              />
              <select
                value={pickupStart}
                onChange={e => setPickupStart(e.target.value)}
                className="flex-1 min-w-[110px] px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
              >
                <option value="">Start time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-sm text-[var(--input-border)]">–</span>
              <select
                value={pickupEnd}
                onChange={e => setPickupEnd(e.target.value)}
                className="flex-1 min-w-[110px] px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
              >
                <option value="">End time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {pickupTime && (
              <p className="mt-1.5 text-xs text-[var(--input-border)]">{pickupTime}</p>
            )}
          </div>

          {/* divider */}
          <div className="border-t border-[var(--card-border)]" />

          {/* customer availability */}
          <div>
            <label className={labelClass}>Customer Availability</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    day in dayTimes
                      ? 'bg-[var(--teal)] text-white border-[var(--teal)]'
                      : 'bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {Object.keys(dayTimes).length > 0 && (
              <div className="space-y-2">
                {Object.keys(dayTimes).map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-10 text-sm font-medium text-[var(--text)] flex-shrink-0">{day}</span>
                    <input
                      type="text"
                      value={dayTimes[day]}
                      onChange={e => setDayTimes(prev => ({ ...prev, [day]: e.target.value }))}
                      placeholder="e.g. 11am–5pm"
                      className="flex-1 px-3 py-1.5 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* divider */}
          <div className="border-t border-[var(--card-border)]" />

          {/* order notes */}
          <div>
            <label className={labelClass}>Order Notes</label>
            <textarea
              value={form.order_notes}
              onChange={e => setForm(f => ({ ...f, order_notes: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Any special notes..."
            />
          </div>

          {/* total */}
          <div className="border-t border-[var(--card-border)]" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text)]">Total</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--input-border)]">$</span>
              <input
                type="number"
                step="0.01"
                value={finalCost}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) setFinalCost(val);
                }}
                placeholder={calculatedTotal.toFixed(2)}
                className="w-20 px-2 py-1 bg-[var(--header)] border border-[var(--input-border)] rounded-md text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
              />
              <button
                onClick={() => setFinalCost(calculatedTotal.toFixed(2))}
                className="text-xs text-[var(--input-border)] hover:text-[var(--teal)] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* status + submit */}
          <div className="border-t border-[var(--card-border)]" />
          <div>
            <label className={labelClass}>Order Status</label>
            <div className="flex gap-2 mb-4">
              {(['unconfirmed', 'confirmed', 'completed'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                    status === s
                      ? 'bg-[var(--teal)] text-white border-[var(--teal)]'
                      : 'bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {status !== 'unconfirmed' && !form.email && (
              <p className="text-xs text-[var(--input-border)] mb-3">
                No email provided. Confirmation email will not be sent.
              </p>
            )}
            {error && <p className="text-sm text-[var(--rust)] mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
                saving
                  ? 'bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed'
                  : 'bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white'
              }`}
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Saving...' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  onAddItem,
}: {
  reservationId: string;
  onAdd: () => void;
  onAddItem?: (item: { product_name: string; price: number; quantity: number, product_id?: string | null; stock?: number }) => void;
}) {
  const supabase = createClient();
  const [mode, setMode] = useState<"search" | "custom">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock")   // add stock
      .ilike("name", `%${q}%`)
      .limit(5);
    setResults(data || []);
  };

  const handleAddProduct = async (product: any) => {
    setAdding(true);
    if (onAddItem) {
      onAddItem({ product_name: product.name, price: product.price, quantity: 1, product_id: product.id, stock: product.stock });
    } else {
      // race condition check for existing reservations
      const { data: freshProduct } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product.id)
        .single();

      if (!freshProduct || freshProduct.stock < 1) {
        setError("Not enough stock.");
        setAdding(false);
        return;
      }

      await supabase.from("reservation_items").insert({
        reservation_id: reservationId,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        is_custom: false,
      });

      await supabase
        .from("products")
        .update({ stock: freshProduct.stock - 1 })
        .eq("id", product.id)
        .eq("stock", freshProduct.stock); // optimistic lock
    }
    setQuery("");
    setResults([]);
    onAdd();
    setAdding(false);
  };

  const handleAddCustom = async () => {
    if (!customName || !customPrice) return;
    setAdding(true);
    if (onAddItem) {
      onAddItem({ product_name: customName, price: parseFloat(customPrice), quantity: parseInt(customQty) || 1 });
    } else {
      await supabase.from("reservation_items").insert({
        reservation_id: reservationId,
        product_id: null,
        product_name: customName,
        price: parseFloat(customPrice),
        quantity: parseInt(customQty) || 1,
        is_custom: true,
      });
    }
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
          {error && <p className="text-xs text-[var(--rust)] mt-1">{error}</p>}
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
                  
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[var(--input-border)] hover:text-[var(--rust)] transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  
                  <span className="flex-1 text-sm text-[var(--text)]">
                    {item.product_name}
                  </span>
                  
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 bg-[var(--teal)] hover:bg-[var(--teal-hover)] rounded flex items-center justify-center text-xs font-bold text-white transition-colors"
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
                
                  <span className="text-sm text-[var(--text)] w-16 text-right flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* add item */}
            
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
            

            {/* total */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--card-border)]">
              <span className="text-sm font-medium text-[var(--text)]">
                Total
              </span>
              <div className="flex items-center gap-2">
                
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
          {reservation.status === "completed" && (
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
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold text-[var(--text)]">Orders</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          New Order
        </button>
      </div>
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
      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchReservations}
        />
      )}
    </div>
  );
}
