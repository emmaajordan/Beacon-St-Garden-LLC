"use client";

import ProductCard from "@/components/shop/ProductCard";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { Loader2, SlidersHorizontal, ChevronUp, ChevronDown} from "lucide-react";


export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  const router = useRouter();
  const pathname = usePathname();

  const selectedCategories = searchParams.getAll('category');
  const selectedAvailability = searchParams.getAll('availability');
  const searchQuery = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sort') ?? 'newest';

  const updateParams = (updates: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.delete(key);
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // toggle filter selections
  const toggleCategory = (category: string) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    updateParams({ category: next });
  };

  const toggleAvailability = (availability: string) => {
    const next = selectedAvailability.includes(availability)
      ? selectedAvailability.filter(a => a !== availability)
      : [...selectedAvailability, availability];
    updateParams({ availability: next });
  };
  const setSearchQuery = (q: string) => updateParams({ search: q });
  const setSortBy = (s: string) => updateParams({ sort: s });
  const selectedSun = searchParams.getAll('sun');
  const categoryOpen = searchParams.get('catOpen') !== 'false';
  const sunOpen = searchParams.get('sunOpen') === 'true';
  const availabilityOpen = searchParams.get('availOpen') === 'true';

  const setCategoryOpen = (val: boolean) => updateParams({ catOpen: val ? 'true' : 'false' });
  const setSunOpen = (val: boolean) => updateParams({ sunOpen: val ? 'true' : 'false' });
  const setAvailabilityOpen = (val: boolean) => updateParams({ availOpen: val ? 'true' : 'false' });
  const toggleSun = (sun: string) => {
  const next = selectedSun.includes(sun)
      ? selectedSun.filter(s => s !== sun)
      : [...selectedSun, sun];
    updateParams({ sun: next });
  };

  const SUN_FILTER_GROUPS: Record<string, string[]> = {
    "Full Sun":                    ["Full Sun", "Part Sun"],
    "Part Sun":                    ["Part Sun", "Full Sun", "Part-Shade"],
    "Part-Shade":                  ["Part-Shade", "Part-Shade to Full-Shade", "Full-Shade to Part-Shade", "Part Sun"],
    "Part-Shade to Full-Shade":    ["Part-Shade to Full-Shade", "Part-Shade", "Shade", "Full-Shade to Part-Shade"],
    "Full-Shade to Part-Shade":    ["Full-Shade to Part-Shade", "Part-Shade", "Shade", "Part-Shade to Full-Shade"],
    "Shade":                       ["Shade", "Dapple Shade", "Part-Shade to Full-Shade", "Full-Shade to Part-Shade"],
    "Dapple Shade":                ["Dapple Shade", "Shade", "Part-Shade"],
  };
  // filter & sort products
  const filteredProducts = useMemo(() => {
    if (allProducts.length === 0) return [];
    let filtered = allProducts;

    // apply a category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        Array.isArray(p.category)
          ? p.category.some((c: string) => selectedCategories.includes(c))
          : selectedCategories.includes(p.category)
      );
    }

    if (selectedSun.length > 0) {
      const expandedSun = new Set(
        selectedSun.flatMap(s => SUN_FILTER_GROUPS[s] ?? [s])
      );
      filtered = filtered.filter(p => p.sun && expandedSun.has(p.sun));
    }

    // apply availability filter
    if (selectedAvailability.length > 0) {
      filtered = filtered.filter((p) =>
        selectedAvailability.includes(p.availability),
      );
    }

    // apply search
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "a-z":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
        break;
    }

    return sorted;
  }, [
    allProducts,
    selectedCategories,
    selectedSun,
    selectedAvailability,
    searchQuery,
    sortBy,
  ]);

  // pagination setup
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("showing", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setAllProducts(data || []);
        setCurrentPage(1);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--header)]">
      {/*hero section*/}
      <section className="relative h-64 bg-[var(--footer)]">
        {/*background image*/}
        <div className="absolute inset-0 bg-green-950 opacity-75" />

        {/*overlay card*/}
        <div className="relative h-full mx-auto px-8 flex items-center">
          <div className="bg-[var(--hero-square)] backdrop-blur-sm p-5 max-w-lg">
            <div className="border border-[var(--lines)] p-5">
              <h1 className="text-3xl font-semibold text-[var(--text)] mb-2">
                Shop Beacon Street Gardens
              </h1>
              <p className="text-base text-[var(--text)]">
                Reserve fresh vegetables, herbs, and flowers
                <br />
                fresh from our garden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*main shop*/}
      <div className="mx-auto px-4 md:px-8 py-4 md:py-8">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          {/*filters*/}
          <aside className="w-full md:w-52 md:flex-shrink-0">
            {/* mobile toggle */}
            <button
              className="flex md:hidden items-center gap-2 mb-2 text-sm font-medium text-[var(--text)] border border-[var(--card-border)] px-3 py-1.5 rounded-md bg-[var(--card-bg)]"
              onClick={() => setFiltersOpen(prev => !prev)}
            >
              <SlidersHorizontal size={14} />
              {filtersOpen ? 'Hide Filters' : 'Filters'}
              {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div className={`${filtersOpen ? 'block' : 'hidden'} mb-2 md:block bg-[var(--card-bg)] p-3 md:p-5 rounded-lg border border-[var(--card-border)] shadow-sm md:sticky top-24`}>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-2 pb-2 border-b border-[var(--card-border)] md:text-base md:mb-3">
                Filters
              </h3>

              {/*category*/}
              <div className="mb-3 md:mb-5">
                <button
                  type="button"
                  onClick={() => setCategoryOpen(prev => !prev)}
                  className="flex items-center gap-1 font-medium text-[var(--text)] hover:text-[var(--rust)] mb-1.5 text-xs md:text-sm transition-colors group"
                >
                  <span>Category</span>
                  {categoryOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                {categoryOpen && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 md:block md:space-y-1.5">
                  {/*TO ADD MORE CATEGORIES, ADD TO LIST BELOW*/}
                  {[
                    "Vegetable/Fruit",
                    "Herbs",
                    "Flowers",
                    "Annual",
                    "Perennial",
                    "House Plant",
                    "Ornamental Foliage",
                  ].map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer hover:text-[var(--rust)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>)}
              </div>
              {/*sun*/}
              <div className="mb-3 md:mb-5">
                <button
                  type="button"
                  onClick={() => setSunOpen(prev => !prev)}
                  className="flex items-center gap-1 font-medium text-[var(--text)] hover:text-[var(--rust)] mb-1.5 text-xs md:text-sm transition-colors group"
                >
                  <span>Sun</span>
                  {sunOpen ? <ChevronUp size={11} className="group-hover:text-[var(--rust)] transition-colors" /> : <ChevronDown size={11} className="group-hover:text-[var(--rust)] transition-colors" />}
                </button>
                {sunOpen && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 md:block md:space-y-1.5">
                    {Object.keys(SUN_FILTER_GROUPS).map((sun) => (
                      <label
                        key={sun}
                        className="flex items-center gap-2 cursor-pointer hover:text-[var(--rust)] transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                          checked={selectedSun.includes(sun)}
                          onChange={() => toggleSun(sun)}
                        />
                        <span className="text-sm">{sun}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/*availability*/}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setAvailabilityOpen(prev => !prev)}
                  className="flex items-center gap-1 font-medium text-[var(--text)] hover:text-[var(--rust)] mb-1.5 text-xs md:text-sm transition-colors group"
                >
                  <span>Availability</span>
                  {availabilityOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                {availabilityOpen && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 md:block md:space-y-1.5">
                  {/*TO ADD DIFFERENT AVAILABILITY, ADD TO LIST BELOW*/}
                  {["Ready Now", "Coming Soon"].map((availability) => (
                    <label
                      key={availability}
                      className="flex items-center gap-2 cursor-pointer hover:text-[var(--rust)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                        checked={selectedAvailability.includes(availability)}
                        onChange={() => toggleAvailability(availability)}
                      />
                      <span className="text-sm">{availability}</span>
                    </label>
                  ))}
                </div>)}
              </div>

              {/*clears all filters*/}
              <button
                onClick={() => router.push(pathname, { scroll: false })}
                className="w-full bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white py-1.5 md:py-2 px-4 rounded-md transition-colors font-medium text-xs md:text-sm"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/*products*/}
          <main className="flex-1">
            {/*search & sort bar*/}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] placeholder:text-[var(--input-border)] placeholder:opacity-70"
                />
              </div>
              <div className="flex items-center pl-4 gap-4 flex-shrink-0">
                <span className="hidden md:inline text-sm text-[var(--text)]">
                  {filteredProducts.length > 0
                    ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} Products`
                    : ""}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-2 md:px-4 py-2 bg-transparent border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
                >
                  <option value=" ">Sort by: Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="a-z">A-Z</option>
                </select>
              </div>
            </div>

            {/*product grid*/}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {loading ? (
                <div className="col-span-2 md:col-span-5 flex items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin text-[var(--teal)]"
                  />
                </div>
              ) : (
                currentProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))
              )}
            </div>

            {/*no results*/}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-[var(--text)]">
                  No products found matching your filters.
                </p>
                <button
                  onClick={() => router.push(pathname, { scroll: false })}
                  className="mt-4 text-[var(--rust)] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/*pagination*/}
            {!loading && filteredProducts.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-4 py-2 transition-colors ${
                    currentPage === 1
                      ? "text-transparent"
                      : "text-[var(--text)] hover:text-[var(--rust)]"
                  }`}
                >
                  ←
                </button>
                <span className="text-[var(--text)]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 transition-colors ${
                    currentPage === totalPages
                      ? "text-transparent"
                      : "text-[var(--text)] hover:text-[var(--rust)]"
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
