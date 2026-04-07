"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Pencil,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

const SOIL_OPTIONS = [
  "rich",
  "well-drained",
  "moist",
  "high in organic matter",
  "wet",
  "nutrient-poor",
  "sandy or gravely",
  "fertile",
  "loose",
];
const SUN_OPTIONS = [
  "Full Sun",
  "Part-Shade",
  "Part-Shade to Full-Shade",
  "Part-Sun to Full-Sun",
  "Shade",
  "Dapple Shade",
  "Part Sun",
];
const LIGHT_OPTIONS = ["Bright Direct", "Bright Indirect", "Medium", "Low"];
const CATEGORY_OPTIONS = [
  "Vegetable/Fruit",
  "Herbs",
  "Flowers",
  "Annual",
  "Perennial",
  "House Plant",
  "Ornamental Foliage",
];
const LIFE_SPAN_OPTIONS = ["Annual", "Perennial"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: [] as string[],
  sun: "",
  light: "",
  watering: "",
  soil: [] as string[],
  ph_min: "",
  ph_max: "",
  spacing: "",
  height: "",
  life_span: "",
  care_notes: "",
  availability: "Ready Now",
  stock: "",
  showing: true,
  image_url: "",
};

const labelClass =
  "block text-xs uppercase tracking-widest text-[var(--input-border)] mb-1";
const inputClass =
  "w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]";
const sectionClass = "border-t border-[var(--card-border)] pt-6 mt-6";
function ImageManager({
  
  imageFiles,
  setImageFiles,
  existingUrls,
  setExistingUrls,
}: {
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  existingUrls: string[];
  setExistingUrls: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const supabase = createClient(); 


  const moveExisting = (index: number, dir: -1 | 1) => {
    const next = [...existingUrls];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setExistingUrls(next);
  };

  const moveNew = (index: number, dir: -1 | 1) => {
    const next = [...imageFiles];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImageFiles(next);
  };

  const removeExisting = async (index: number) => {
    const url = existingUrls[index];
    const filename = url.split('/').pop();
    if (filename) {
      await supabase.storage.from('product-images').remove([filename]);
    } 
    setExistingUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {existingUrls.map((url, i) => (
          <div key={url} className="relative flex flex-col items-center gap-1">
            <div className="relative w-20 h-20 rounded-md overflow-hidden border border-[var(--card-border)]">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveExisting(i, -1)} disabled={i === 0}
                className="w-5 h-5 flex items-center justify-center rounded bg-[var(--card-border)] hover:bg-[var(--button-gray)] disabled:opacity-30 transition-colors">
                <ChevronLeft size={10} />
              </button>
              <button type="button" onClick={() => moveExisting(i, 1)} disabled={i === existingUrls.length - 1 && imageFiles.length === 0}
                className="w-5 h-5 flex items-center justify-center rounded bg-[var(--card-border)] hover:bg-[var(--button-gray)] disabled:opacity-30 transition-colors">
                <ChevronRight size={10} />
              </button>
            </div>
          </div>
        ))}
        {imageFiles.map((f, i) => (
          <div key={`new-${i}`} className="relative flex flex-col items-center gap-1">
            <div className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-dashed border-[var(--teal)]">
              <Image src={URL.createObjectURL(f)} alt={`New ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveNew(i, -1)} disabled={i === 0}
                className="w-5 h-5 flex items-center justify-center rounded bg-[var(--card-border)] hover:bg-[var(--button-gray)] disabled:opacity-30 transition-colors">
                <ChevronLeft size={10} />
              </button>
              <button type="button" onClick={() => moveNew(i, 1)} disabled={i === imageFiles.length - 1}
                className="w-5 h-5 flex items-center justify-center rounded bg-[var(--card-border)] hover:bg-[var(--button-gray)] disabled:opacity-30 transition-colors">
                <ChevronRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setImageFiles(prev => [...prev, ...files]);
            e.target.value = '';
          }}
          className="hidden"
        />
        Choose Files
      </label>
    </div>
  );
}

function AddProductModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSoil = (val: string) => {
    setForm((prev) => ({
      ...prev,
      soil: prev.soil.includes(val)
        ? prev.soil.filter((s) => s !== val)
        : [...prev.soil, val],
    }));
  };

  const toggleCategory = (val: string) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(val)
        ? prev.category.filter((c: string) => c !== val)
        : [...prev.category, val],
    }));
  };


  const handleSubmit = async () => {
    if (!form.name) {
      setError("Name is required.");
      return;
    }
    setUploading(true);
    setError("");


    let uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file);

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      uploadedUrls.push(urlData.publicUrl);
    }

    const allImageUrls = [...existingUrls, ...uploadedUrls];

    const { error: insertError } = await supabase.from("products").insert({
      name: form.name,
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      category: form.category.length > 0 ? form.category : null,
      sun: form.sun || null,
      light: form.light || null,
      watering: form.watering || null,
      soil: form.soil.length > 0 ? form.soil : null,
      ph_min: form.ph_min ? parseFloat(form.ph_min) : null,
      ph_max: form.ph_max ? parseFloat(form.ph_max) : null,
      spacing: form.spacing || null,
      height: form.height || null,
      life_span: form.life_span || null,
      care_notes: form.care_notes || null,
      availability: form.availability,
      stock: form.stock ? parseInt(form.stock) : 0,
      showing: form.showing,
      image_url: allImageUrls[0] || null,
      image_urls: allImageUrls.length > 0 ? allImageUrls : null,
    });

    if (insertError) {
      setError("Failed to add product: " + insertError.message);
    } else {
      onSuccess();
      onClose();
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[var(--header)] rounded-lg shadow-xl border border-[var(--card-border)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--header)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-border)] transition-colors text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className={labelClass}>Product Images</label>
            <ImageManager
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              existingUrls={existingUrls}
              setExistingUrls={setExistingUrls}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Name <span className="text-[var(--rust)]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
                placeholder="Product name"
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Short description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                        form.category.includes(cat)
                          ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                          : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Availability</label>
                <select
                  value={form.availability}
                  onChange={(e) => set("availability", e.target.value)}
                  className={inputClass}
                >
                  <option value="Ready Now">Ready Now</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Showing on Shop</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={form.showing}
                  onChange={(e) => set("showing", e.target.checked)}
                  className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                />
                <span className="text-sm text-[var(--text)]">
                  Visible to customers
                </span>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
              Care & Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Life Span</label>
                  <select
                    value={form.life_span}
                    onChange={(e) => set("life_span", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {LIFE_SPAN_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Watering</label>
                  <input
                    type="text"
                    value={form.watering}
                    onChange={(e) => set("watering", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Every 2-3 days"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sun (Outdoors)</label>
                  <select
                    value={form.sun}
                    onChange={(e) => set("sun", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {SUN_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Light (Indoors)</label>
                  <select
                    value={form.light}
                    onChange={(e) => set("light", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {LIGHT_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Spacing</label>
                  <input
                    type="text"
                    value={form.spacing}
                    onChange={(e) => set("spacing", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 12 inches"
                  />
                </div>
                <div>
                  <label className={labelClass}>Height</label>
                  <input
                    type="text"
                    value={form.height}
                    onChange={(e) => set("height", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 12-24 inches"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>pH Min</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={form.ph_min}
                    onChange={(e) => set("ph_min", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 6.0"
                  />
                </div>
                <div>
                  <label className={labelClass}>pH Max</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={form.ph_max}
                    onChange={(e) => set("ph_max", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 7.0"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Soil Types</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SOIL_OPTIONS.map((soil) => (
                    <button
                      key={soil}
                      type="button"
                      onClick={() => toggleSoil(soil)}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                        form.soil.includes(soil)
                          ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                          : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]"
                      }`}
                    >
                      {soil}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Care Notes</label>
                <textarea
                  value={form.care_notes}
                  onChange={(e) => set("care_notes", e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Any additional care instructions..."
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            {error && (
              <p className="text-sm text-[var(--rust)] mb-3">{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
                uploading
                  ? "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                  : "bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white"
              }`}
            >
              {uploading && <Loader2 size={15} className="animate-spin" />}
              {uploading ? "Saving..." : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onDelete,
  onUpdate,
}: {
  product: any;
  onDelete: () => void;
  onUpdate: (updated: any) => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>(
    Array.isArray(product.image_urls) ? product.image_urls : 
    product.image_url ? [product.image_url] : []
  );

  const [form, setForm] = useState({
    name: product.name ?? "",
    description: product.description ?? "",
    price: product.price ?? "",
    category: Array.isArray(product.category) ? product.category : product.category ? [product.category] : [],
    sun: product.sun ?? "",
    light: product.light ?? "",
    watering: product.watering ?? "",
    soil: product.soil ?? [],
    ph_min: product.ph_min ?? "",
    ph_max: product.ph_max ?? "",
    spacing: product.spacing ?? "",
    height: product.height ?? "",
    life_span: product.life_span ?? "",
    care_notes: product.care_notes ?? "",
    availability: product.availability ?? "Ready Now",
    stock: product.stock ?? 0,
    showing: product.showing ?? true,
    image_url: product.image_url ?? "",
  });

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSoil = (val: string) => {
    setForm((prev) => ({
      ...prev,
      soil: prev.soil.includes(val)
        ? prev.soil.filter((s: string) => s !== val)
        : [...prev.soil, val],
    }));
  };

  const toggleCategory = (val: string) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(val)
        ? prev.category.filter((c: string) => c !== val)
        : [...prev.category, val],
    }));
  };



  const handleSave = async () => {
    if (!form.name) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    let uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file);

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      uploadedUrls.push(urlData.publicUrl);
    }

    const allImageUrls = [...existingUrls, ...uploadedUrls];

    const updates = {
      name: form.name,
      description: form.description || null,
      price: form.price !== "" ? parseFloat(String(form.price)) : null,
      category: form.category.length > 0 ? form.category : null,
      sun: form.sun || null,
      light: form.light || null,
      watering: form.watering || null,
      soil: form.soil.length > 0 ? form.soil : null,
      ph_min: form.ph_min !== "" ? parseFloat(String(form.ph_min)) : null,
      ph_max: form.ph_max !== "" ? parseFloat(String(form.ph_max)) : null,
      spacing: form.spacing || null,
      height: form.height || null,
      life_span: form.life_span || null,
      care_notes: form.care_notes || null,
      availability: form.availability,
      stock: parseInt(String(form.stock)) || 0,
      showing: form.showing,
      image_url: allImageUrls[0] || null,
      image_urls: allImageUrls.length > 0 ? allImageUrls : null,
    };

    const { error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", product.id);

    if (updateError) {
      setError("Failed to save: " + updateError.message);
    } else {
      onUpdate({ ...product, ...updates });
      setEditing(false);
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    // delete images from storage first
    const urls: string[] = Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url ? [product.image_url] : [];

    if (urls.length > 0) {
      const filenames = urls.map(url => url.split('/').pop()!).filter(Boolean);
      await supabase.storage.from('product-images').remove(filenames);
    }
    await supabase.from("products").delete().eq("id", product.id);
    onDelete();
  };

  const val = (v: any) => {
    if (v === null || v === undefined || v === "")
      return <span className="text-[var(--input-border)] italic">null</span>;
    if (Array.isArray(v))
      return v.length > 0 ? (
        v.join(", ")
      ) : (
        <span className="text-[var(--input-border)] italic">null</span>
      );
    return String(v);
  };

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-baseline justify-between py-2 border-b border-dashed border-[var(--card-border)]">
      <span className="text-xs uppercase tracking-widest text-[var(--input-border)] flex-shrink-0 mr-4">
        {label}
      </span>
      <span className="text-sm text-[var(--text)] text-right">
        {val(value)}
      </span>
    </div>
  );

  return (
    <div className="border border-[var(--card-border)] rounded-lg overflow-hidden">
      {/* row header */}
      <div
        className="flex items-center gap-4 p-4 bg-[var(--card-bg)] cursor-pointer hover:bg-[var(--card-border)] transition-colors"
        onClick={() => {
          setExpanded((prev) => !prev);
          setEditing(false);
        }}
      >
        {/* thumbnail */}
        <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-[var(--card-border)]">
          {product.image_url ? (
            <Image
              src={product.image_url}
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
                width={20}
                height={20}
                className="opacity-40"
              />
            </div>
          )}
        </div>

        {/* name + category + mobile summary */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text)] text-sm truncate">
            {product.name}
          </p>
          <p className="text-xs text-[var(--input-border)]">
            {Array.isArray(product.category) 
              ? product.category.join(" · ") 
              : product.category ?? "—"}
          </p>
          <p className="text-xs text-[var(--input-border)] sm:hidden">
            {product.price > 0
              ? `$${parseFloat(product.price).toFixed(2)} · `
              : ""}
            <span className={product.stock === 0 ? "text-[var(--rust)]" : ""}>
              {product.stock} in stock
            </span>
          </p>
        </div>

        {/* price*/}
        <div className="hidden sm:block text-sm text-[var(--text)] w-16 text-right flex-shrink-0">
          {product.price > 0 ? `$${parseFloat(product.price).toFixed(2)}` : "—"}
        </div>

        {/* stock*/}
        <div className="hidden sm:block text-sm w-16 text-center flex-shrink-0">
          <span
            className={
              product.stock === 0 ? "text-[var(--rust)]" : "text-[var(--text)]"
            }
          >
            {product.stock} in stock
          </span>
        </div>

        {/* availability*/}
        <div className="hidden md:block flex-shrink-0">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              product.availability === "Ready Now" && product.stock > 0
                ? "bg-[var(--teal)] text-white"
                : "bg-[var(--disabled-bg)] text-[var(--disabled-text)]"
            }`}
          >
            {product.stock === 0 ? "Out of Stock" : product.availability}
          </span>
        </div>

        {/* visible */}
        <div className="hidden md:flex flex-shrink-0 text-xs text-[var(--input-border)]">
          {product.showing ? (
            <span className="flex items-center gap-1">
              <Eye size={13} /> Visible
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Ban size={13} /> Hidden
            </span>
          )}
        </div>

        <div className="flex-shrink-0 text-[var(--input-border)]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* expanded section */}
      {expanded && (
        <div className="p-5 bg-[var(--header)] border-t border-[var(--card-border)]">
          {editing ? (
            // ——— EDIT FORM ———
            <div>
              <div className="mb-6">
                <label className={labelClass}>Product Images</label>
                <ImageManager
                  imageFiles={imageFiles}
                  setImageFiles={setImageFiles}
                  existingUrls={existingUrls}
                  setExistingUrls={setExistingUrls}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Name <span className="text-[var(--rust)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => set("stock", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                            form.category.includes(cat)
                              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                              : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Availability</label>
                    <select
                      value={form.availability}
                      onChange={(e) => set("availability", e.target.value)}
                      className={inputClass}
                    >
                      <option value="Ready Now">Ready Now</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Showing on Shop</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={form.showing}
                      onChange={(e) => set("showing", e.target.checked)}
                      className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text)]">
                      Visible to customers
                    </span>
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
                  Care & Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Life Span</label>
                      <select
                        value={form.life_span}
                        onChange={(e) => set("life_span", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select...</option>
                        {LIFE_SPAN_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Watering</label>
                      <input
                        type="text"
                        value={form.watering}
                        onChange={(e) => set("watering", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Sun (Outdoors)</label>
                      <select
                        value={form.sun}
                        onChange={(e) => set("sun", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select...</option>
                        {SUN_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Light (Indoors)</label>
                      <select
                        value={form.light}
                        onChange={(e) => set("light", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select...</option>
                        {LIGHT_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Spacing</label>
                      <input
                        type="text"
                        value={form.spacing}
                        onChange={(e) => set("spacing", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Height</label>
                      <input
                        type="text"
                        value={form.height}
                        onChange={(e) => set("height", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>pH Min</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={form.ph_min}
                        onChange={(e) => set("ph_min", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>pH Max</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={form.ph_max}
                        onChange={(e) => set("ph_max", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Soil Types</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {SOIL_OPTIONS.map((soil) => (
                        <button
                          key={soil}
                          type="button"
                          onClick={() => toggleSoil(soil)}
                          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                            form.soil.includes(soil)
                              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                              : "bg-[var(--header)] text-[var(--text)] border-[var(--input-border)] hover:border-[var(--teal)]"
                          }`}
                        >
                          {soil}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Care Notes</label>
                    <textarea
                      value={form.care_notes}
                      onChange={(e) => set("care_notes", e.target.value)}
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--card-border)]">
                {error && (
                  <p className="text-sm text-[var(--rust)] mr-2">{error}</p>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-colors ${
                    saving
                      ? "bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed"
                      : "bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white"
                  }`}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setImageFiles([]);
                  }}
                  className="px-5 py-2 rounded-md font-medium text-sm border border-[var(--card-border)] text-[var(--text)] hover:bg-[var(--card-bg)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // ——— READ VIEW ———
            <div>
              {(product.image_urls?.length > 0 || product.image_url) && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {(product.image_urls?.length > 0 ? product.image_urls : [product.image_url]).map((url: string, i: number) => (
                    <div key={url} className="relative w-20 h-20 rounded-md overflow-hidden border border-[var(--card-border)]">
                      <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-3 font-medium">
                    Basic Info
                  </p>
                  <Field label="Name" value={product.name} />
                  <Field label="Description" value={product.description} />
                  <Field
                    label="Price"
                    value={
                      product.price
                        ? `$${parseFloat(product.price).toFixed(2)}`
                        : null
                    }
                  />
                  <Field label="Stock" value={product.stock} />
                  <Field label="Category" value={product.category} />
                  <Field label="Availability" value={product.availability} />
                  <Field
                    label="Showing"
                    value={product.showing ? "Yes" : "No"}
                  />
                </div>
                <div className="mt-6 md:mt-0">
                  <p className="text-xs uppercase tracking-widest text-[var(--input-border)] mb-3 font-medium">
                    Care & Details
                  </p>
                  <Field label="Life Span" value={product.life_span} />
                  <Field label="Sun" value={product.sun} />
                  <Field label="Light" value={product.light} />
                  <Field label="Watering" value={product.watering} />
                  <Field label="Soil" value={product.soil} />
                  <Field label="pH Min" value={product.ph_min} />
                  <Field label="pH Max" value={product.ph_max} />
                  <Field label="Spacing" value={product.spacing} />
                  <Field label="Height" value={product.height} />
                  <Field label="Care Notes" value={product.care_notes} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-sm text-[var(--input-border)] hover:text-[var(--teal)] transition-colors"
                >
                  <Pencil size={14} />
                  Edit Product
                </button>

                <span className="text-[var(--card-border)]">|</span>

                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-sm text-[var(--input-border)] hover:text-[var(--rust)] transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete Product
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
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
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsTab() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const handleUpdate = (updated: any) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Products{" "}
          <span className="text-sm font-normal text-[var(--input-border)] ml-1">
            {products.length} total
          </span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 mb-6 bg-transparent border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] placeholder:text-[var(--input-border)] placeholder:opacity-70"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[var(--teal)]" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-[var(--input-border)] text-center py-12">
          No products yet.
        </p>
      ) : (
        <div className="space-y-2">
          {products
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onDelete={fetchProducts}
                onUpdate={handleUpdate}
              />
            ))}
        </div>
      )}

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}
