
  /**
   * schema: blog_posts
   * columns:
   *  title
   *  excerpt
   *  content
   *  image_url
   *  published (true = lives on site, false = draft)
   *  created_at/updated_at (managed by db, no need to touch these)
   *
   * IMAGES:
   *  Images don't get directly stored in DB. Instead we are using Supabase Storage.
   *  There is a bucket called blog-images. Supabase gives you back a public URL. That
   *  URL is what you store in image_url. To get the URL after uploading:
   *
   *  const { data } = supabase.storage.from('blog-images').getPublicUrl(filename)
   *
   *  data.publicUrl is what you save to the database
   *
   *
   * READING POSTS (on the home page)
   *  const { data } = await supabase
   *    .from('blog_posts')
   *    .select('*')
   *    .eq('published', true)
   *    .order('created_at', { ascending: false })
   *
   *  the query may be changed depending on how many posts we want to show.
   *  this just shows all published posts.
   *
   *
   * CREATING POSTS
   *  await supabase.from('blog_posts').insert({
   *    title: 'Enter Title Here',
   *    excerpt: 'Here is the Excerpt',
   *    content: 'Here is the Content (will be md style i assume)',
   *    image_url: 'https://...supabase.co/storage/v1/object/public/blog-images/photo.jpg',
   *    published: true
   *  })
   *
   *
   * UPDATING A POST
   * await supabase.from('blog_posts').update({ title: 'New Title' }).eq('id', postId)
   *
   *
   * DELETING A POST
   * await supabase.from('blog_posts').delete().eq('id', postId)
   *
   * note that if you delete a post, the image file stays in the Storage bucket
   * unless you explicitly remove it too... i dont think this matters too much but
   * it may be best to add
   *  await supabase.storage.from('blog-images').remove([filename])
   *
   *
   * NOTES:
   * For uploading images, check you handleImageUpload works in the ProductsTab.tsx
   * The blog version is identical, just swap product-images for blog-images.
   *
   */
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from "@/lib/supabase/client";
import {
  Ban,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload, 
  X,
} from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';

const styles = {
  labelClass: "block text-xs uppercase tracking-widest text-[var(--input-border)] mb-1",
  inputClass: "w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]",
  sectionClass: "border-t border-[var(--card-border)] pt-6 mt-6",
};

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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  image_url: "",
  published: true,
};

function AddPostModal({
  imageList,
  onClose,
  onSuccess,
}: {
  imageList: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showImages, setShowImages] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title) {
      setError("Title is required.");
      return;
    }
    setUploading(true);
    setError("");

    let image_url = form.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filename, imageFile);

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filename);

      image_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("blog_posts").insert({
      title: form.title,
      excerpt: form.excerpt || null,
      content: form.content || null,
      image_url: image_url || null,
      published: form.published,
    });

    if (insertError) {
      setError("Failed to add blog post: " + insertError.message);
    } else {
      onSuccess();
      onClose();
    }

    setUploading(false);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .ilike("name", `%${q}%`)
      .limit(5);
    setSearchResults(data || []);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyNotification(true);
    setTimeout(() => {
      setCopyNotification(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[var(--header)] rounded-lg shadow-xl border border-[var(--card-border)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--header)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Create New Blog Post
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-border)] transition-colors text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* Thumbnail */}
          <div className="mb-6">
            <label className={styles.labelClass}>Thumbnail Image</label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative w-28 h-28 rounded-md overflow-hidden border border-[var(--card-border)] flex-shrink-0">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-md border border-dashed border-[var(--input-border)] flex items-center justify-center flex-shrink-0 bg-[var(--card-bg)]">
                  <Upload size={20} className="text-[var(--input-border)]" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-[var(--text)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[var(--teal)] file:text-white hover:file:bg-[var(--teal-hover)] file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* title */}
            <div>
              <label className={styles.labelClass}>
                Title <span className="text-[var(--rust)]">*</span>
              </label>
              <input 
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={styles.inputClass}
                placeholder="Title of post"
              />
            </div>

            {/* excerpt */}
            <div>
              <label className={styles.labelClass}>
                Excerpt
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                className={`${styles.inputClass} resize-none`}
                placeholder="Preview to be displayed on home page..."
              />
            </div>

            {/* content */}
            <div>
              <label className={styles.labelClass}>
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={4}
                className={`${styles.inputClass}`}
                placeholder="Post in markdown..."
              />
            </div>

            {/* published */}
            <div className="mt-4">
              <label className={styles.labelClass}>Make visible on home page</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => set("published", e.target.checked)}
                  className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                />
                <span className="text-sm text-[var(--text)]">
                  Publish Blog Post
                </span>
              </div>
            </div>

            {/* divider */}
            <div className="border-t border-[var(--card-border)]" />

            {/* Search Products */}
            <div className="relative">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--input-border)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search product urls..."
                  className="w-full pl-8 pr-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[var(--header)] border border-[var(--card-border)] rounded-md shadow-md z-10 mt-1">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleCopy("placeholder link")}
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

            {/* List of Images */}
            <button
              className="flex items-center gap-2 mb-2 text-sm font-medium text-[var(--input-border)] border border-[var(--input-border)] px-3 py-1.5 rounded-md"
              onClick={() => setShowImages(prev => !prev)}
            >
              {showImages ? 'Hide Images' : 'Browse Images'}
              {showImages ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showImages && (
              <div>
                {imageList.length === 0 ? (
                  <p className="text-sm text-[var(--input-border)] text-center py-12">
                    No images uploaded yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-70 md:max-h-48 p-4 overflow-scroll border border-(--input-border) rounded-md">
                    {imageList.map((image) => (
                      <div key={image.id} className="relative">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden cursor-pointer active:scale-95 transition-transform duration-100">
                          <Image 
                            src={image.url}
                            alt="image preview"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200 overflow-hidden"
                            onClick={() => {
                              const str = "![](" + image.url + ")";
                              handleCopy(str)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>    
                )}
              </div>
            )}

            <div className={styles.sectionClass}>
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
                {uploading ? "Saving..." : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Copy notification */}
      {copyNotification && (
        <div className="absolute bottom-4 right-4 bg-[var(--teal)] text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}

function BlogPostRow({
  post,
  onDelete,
  onUpdate,
}: {
  post: any;
  onDelete: () => void;
  onUpdate: (updated: any) => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: post.title ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    image_url: post.image_url ?? "",
    published: post.published ?? false,
  });

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");

    let image_url = form.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filename, imageFile);

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filename);

      image_url = urlData.publicUrl;
    }

    const updates = {
      title: form.title,
      excerpt: form.excerpt || null,
      content: form.content || null,
      image_url: image_url || null,
      published: form.published,
    };

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", post.id);

    if (updateError) {
      setError("Failed to save: " + updateError.message);
    } else {
      onUpdate({ ...post, ...updates });
      setEditing(false);
      setImageFile(null);
      setImagePreview(null);
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    await supabase.from("blog_posts").delete().eq("id", post.id);
    onDelete();
  };

  return (
    <div className="border border-[var(--card-border)] rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 bg-[var(--card-bg)] cursor-pointer hover:bg-[var(--card-border)] transition-colors"
        onClick={() => {
          setExpanded((prev) => !prev);
          setEditing(false);
        }}
      >
        {/* thumbnail */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-[var(--card-border)]">
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
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

          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text)] text-md truncate">
              {post.title}
            </p>
            <p className="text-sm text-[var(--input-border)]">
              Created: {formatDateTime(post.created_at)}
            </p>
            <p className="text-sm text-[var(--input-border)]">
              Last Updated: {formatDateTime(post.updated_at)}
            </p>
          </div>

          <div className="hidden md:flex flex-shrink-0 text-xs text-[var(--input-border)]">
          {post.published ? (
            <span className="flex items-center gap-1">
              <Eye size={13} /> Published
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Ban size={13} /> Unpublished
            </span>
          )}
        </div>

        <div className="flex-shrink-0 text-[var(--input-border)]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* expanded */}
      {expanded && (
        <div className="p-5 bg-[var(--header)] border-t border-[var(--card-border)]">
          {editing ? (
            // EDIT MODE
            <div className="space-y-4">
              {/* Edit Thumbnail */}
              <div className="mb-6">
                <label className={styles.labelClass}>Thumbnail Image</label>
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-28 rounded-md overflow-hidden border border-[var(--card-border)] flex-shrink-0 bg-[var(--card-bg)]">
                    {imagePreview || form.image_url ? (
                      <Image
                        src={imagePreview ?? form.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload
                          size={20}
                          className="text-[var(--input-border)]"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm text-[var(--text)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[var(--teal)] file:text-white hover:file:bg-[var(--teal-hover)] file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-[var(--input-border)] mt-1.5">
                      Upload a new image to replace the current one
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Title */}
              <div>
                <label className={styles.labelClass}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className={styles.inputClass}
                />
              </div>

              {/* Edit Excerpt */}
              <div>
                <label className={styles.labelClass}>Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  rows={2}
                  className={`${styles.inputClass} resize-none`}
                />
              </div>

              {/* Edit Content */}
              <div>
                <label className={styles.labelClass}>Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={10}
                  className={`${styles.inputClass}`}
                />
              </div>

              {/* Edit Published */}
              <div>
                <label className={styles.labelClass}>Make visible on home page</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => set("published", e.target.checked)}
                    className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                  />
                  <span className="text-sm text-[var(--text)]">
                    Publish Blog Post
                  </span>
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
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="px-5 py-2 rounded-md font-medium text-sm border border-[var(--card-border)] text-[var(--text)] hover:bg-[var(--card-bg)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // VIEW ONLY
          <div>
            <div className="flex justify-end items-center py-2 gap-4">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-sm text-[var(--input-border)] hover:text-[var(--teal)] transition-colors"
              >
                <Pencil size={14} />
                Edit Post
              </button>

              <span className="text-[var(--card-border)]">|</span>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 text-sm text-[var(--input-border)] hover:text-[var(--rust)] transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Post
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

            {/* Excerpt */}
            <div className="flex flex-col gap-2 py-2 pb-4 mb-2 border-y border-dashed border-[var(--card-border)]">
              <span className="text-xs uppercase tracking-widest text-[var(--input-border)] flex-shrink-0 mr-4">
                Excerpt
              </span>
              <span className="text-sm text-[var(--text)]">
                {post.excerpt}
              </span>
            </div>

            {/* Preview */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--input-border)] flex-shrink-0 mr-4 pb-2">
                Preview 
              </p>
              <div className="flex flex-col items-center">
                <div className="max-w-4xl bg-white/40 border border-(--card-border) p-6">
                  <h1 className="text-4xl font-bold py-1">{post.title}</h1>
                  <p className="text-sm text-(--input-border) py-2">{formatDate(post.created_at)}</p>
                  <hr className="mb-4 border-0 h-[2px] bg-(--card-border)" />
                  <MarkdownRenderer md={post.content}/>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddImageModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setUploading(true);
    setError("");

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filename, imageFile);

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }
      else {
        onSuccess();
        onClose();
        setUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[var(--header)] rounded-lg shadow-xl border border-[var(--card-border)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--header)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Upload New Image
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
            <label className={styles.labelClass}>New Image</label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative w-28 h-28 rounded-md overflow-hidden border border-[var(--card-border)] flex-shrink-0">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-md border border-dashed border-[var(--input-border)] flex items-center justify-center flex-shrink-0 bg-[var(--card-bg)]">
                  <Upload size={20} className="text-[var(--input-border)]" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-[var(--text)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[var(--teal)] file:text-white hover:file:bg-[var(--teal-hover)] file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={styles.sectionClass}>
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
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteImageModal({
  img,
  onClose,
  onSuccess,
}: {
  img: any,
  onClose: () => void;
  onSuccess: () => void;
}){
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (filename: string) => {
    setLoading(true);
    const { error: deleteError } = await supabase
      .storage
      .from('blog-images')
      .remove([filename])

    if(error) {
      setError("Failed to delete from database: " + deleteError);
    }
    else {
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[var(--header)] rounded-lg shadow-xl border border-[var(--card-border)] w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--header)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Delete this image?
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-border)] transition-colors text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center p-6">
          <div className="mb-6">
            <div className="relative w-50 h-50 rounded-md overflow-hidden border border-[var(--card-border)] flex-shrink-0">
              <Image
                src={img.url}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {error && (
                <p className="text-sm text-[var(--rust)] mb-3">{error}</p>
              )}
              <button
                onClick={() => handleDelete(img.filename)}
                className="px-3 py-1 bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white text-md rounded-md transition-colors"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Deleting..." : "Yes"}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-[var(--card-bg)] hover:bg-[var(--card-border)] text-[var(--text)] text-md rounded-md transition-colors border border-[var(--card-border)]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function BlogTab() {
  const supabase = createClient();
  const [showModal, setShowModal] = useState(false);
  const [showImgModal, setShowImgModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imgToDelete, setImgToDelete] = useState("");
  const [postLoading, setPostLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published", {ascending: false})
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
    setPostLoading(false);
  }

  const fetchImages = async () => {
    setImageLoading(true);
    const { data, error } = await supabase
      .storage
      .from("blog-images")
      .list();

    if (!error){
      const imageData = data;
      let arr = [];
      for (let i = imageData.length-1; i > 0; i--){
        const { data } = supabase
          .storage
          .from('blog-images')
          .getPublicUrl(imageData[i].name);
        arr.push({'id': i, 'url': data.publicUrl, 'filename': imageData[i].name});
      }
      setImages(arr);
    }
    else setImages([]);
    
    setImageLoading(false);
  }

  const handleUpdate = (updated: any) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText("![](" + url + ")");
    setCopyNotification(true);
    setTimeout(() => {
      setCopyNotification(false);
    }, 2000);
  };

  useEffect(() => {
    fetchPosts();
    fetchImages();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Blog Posts{" "}
          <span className="text-sm font-normal text-[var(--input-border)] ml-1">
            {posts.length} posts
          </span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--rust)] hover:bg-[var(--dark-rust)] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            Create New Post
          </button>

          <button
            onClick={() => setShowImgModal(true)}
            className="flex items-center gap-2 bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Upload size={15} />
            Upload New Image
          </button>
        </div>
      </div>

      <div className="border border-[var(--card-border)] rounded-lg overflow-hidden mb-8">
        <div
          className="flex items-center justify-center gap-2 p-2 bg-[var(--card-bg)] cursor-pointer hover:bg-[var(--card-border)] transition-colors"
          onClick={() => {
            setImageExpanded((prev) => !prev);
          }}
        >  
          <p className="text-md font-medium text-[var(--text)]">Browse Uploaded Images</p>
          <span className="text-[var(--input-border)]">
            {imageExpanded ? <ChevronDown size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {/* Image List */}
        {imageExpanded && (
          <div className="p-5 bg-[var(--header)] border-t border-[var(--card-border)]">
            {imageLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-[var(--teal)]" />
              </div>
            ) : images.length === 0 ? (
              <p className="text-sm text-[var(--input-border)] text-center py-12">
                No images uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 2xl:grid-cols-8 gap-4 max-h-70 md:max-h-100 overflow-scroll">
                {images.map((image) => (
                  <div key={image.id} className="relative">
                    <div className="relative w-full aspect-square rounded-md overflow-hidden cursor-pointer active:scale-95 transition-transform duration-100">
                      <Image 
                      src={image.url}
                      alt="image preview"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200 overflow-hidden"
                      onClick={() => handleCopy(image.url)}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setImgToDelete(image);
                        setShowDeleteModal(true);
                      }}
                      className="absolute bottom-1 right-1 p-1 cursor-pointer bg-[var(--card-bg)]/80 hover:bg-white text-(--dark-rust) rounded-md transition-colors"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>    
            )}
          </div>
        )}
      </div>

      {postLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[var(--teal)]" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-[var(--input-border)] text-center py-12">
          No posts yet.
        </p>
      ) : (
        <div className="space-y-2">
          {posts
            .map((post) => (
              <BlogPostRow
                key={post.id}
                post={post}
                onDelete={fetchPosts}
                onUpdate={handleUpdate}
              />
            ))}
        </div>
      )}

      {(showModal && !showImgModal && !showDeleteModal) && (
        <AddPostModal
          imageList={images.length > 0 ? images : []}
          onClose={() => setShowModal(false)}
          onSuccess={fetchPosts}
        />
      )}

      {(!showModal && showImgModal && !showDeleteModal) && (
        <AddImageModal
          onClose={() => setShowImgModal(false)}
          onSuccess={fetchImages}
        />
      )}

      {(!showModal && !showImgModal && showDeleteModal) && (
        <DeleteImageModal
          img={imgToDelete}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={fetchImages}
        />
      )}
      
      {/* Copy notification */}
      {copyNotification && (
        <div className="fixed bottom-4 right-4 bg-[var(--teal)] text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
