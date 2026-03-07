'use client';

import ProductCard from '@/components/shop/ProductCard';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import { Loader2 } from 'lucide-react'

export default function ShopPage() {
const [allProducts, setAllProducts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);



  const searchParams = useSearchParams();

  // filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
      const category = searchParams.get('category');
      return category ? [category] : [];
  });  
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // toggle filter selections
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAvailability = (availability: string) => {
    setSelectedAvailability(prev =>
      prev.includes(availability) ? prev.filter(a => a !== availability) : [...prev, availability]
    );
  };

  // filter & sort products
  const filteredProducts = useMemo(() => {
    if (allProducts.length === 0) return [];
    let filtered = allProducts;

    // apply a category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // apply type filter
    if (selectedTypes.length > 0) {
     filtered = filtered.filter(p => p.types.some((t: string) => selectedTypes.includes(t)));
    }

    // apply availability filter
    if (selectedAvailability.length > 0) {
      filtered = filtered.filter(p => selectedAvailability.includes(p.availability));
    }

    // apply search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'a-z':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }

    return sorted;
  }, [allProducts,selectedCategories, selectedTypes, selectedAvailability, searchQuery, sortBy]);

  // pagination setup
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('showing', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
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
                        Reserve fresh vegetables, herbs, and flowers<br />
                        fresh from our garden. (probably change. just a placeholder)
                    </p>
                </div>
            </div>
        </div>
        </section>

      {/*main shop*/}
      <div className="mx-auto px-8 py-8">
        <div className="flex gap-6">
          {/*filters*/}
          <aside className="w-52 flex-shrink-0">
            <div className="bg-[var(--card-bg)] p-5 rounded-lg border border-[var(--card-border)] shadow-sm sticky top-24">
              <h3 className="text-base font-semibold text-[var(--text)] mb-3 pb-2 border-b border-[var(--card-border)]">
                Filters
              </h3>

              {/*category*/}
              <div className="mb-5">
                <h4 className="font-medium text-[var(--text)] mb-2 text-sm">Category</h4>
                <div className="space-y-1.5">
                  {/*TO ADD MORE CATEGORIES, ADD TO LIST BELOW*/} 
                  {['Vegetables', 'Plants', 'Flowers'].map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer hover:text-[var(--rust)] transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/*type*/}
              <div className="mb-5">
                <h4 className="font-medium text-[var(--text)] mb-2 text-sm">Type</h4>
                <div className="space-y-1.5">
                  {/*TO ADD MORE TYPES, ADD TO LIST BELOW*/} 
                  {['Shade', 'Partial Shade', 'Full Sun', 'Seedlings'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-[var(--rust)] transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/*availability*/}
              <div className="mb-5">
                <h4 className="font-medium text-[var(--text)] mb-2 text-sm">Availability</h4>
                <div className="space-y-1.5">
                  {/*TO ADD DIFFERENT AVAILABILITY, ADD TO LIST BELOW*/} 
                  {['Ready Now', 'Coming Soon'].map(availability => (
                    <label key={availability} className="flex items-center gap-2 cursor-pointer hover:text-[var(--rust)] transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--teal)] cursor-pointer"
                        checked={selectedAvailability.includes(availability)}
                        onChange={() => toggleAvailability(availability)}
                      />
                      <span className="text-sm">{availability}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/*clears all filters*/}
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedTypes([]);
                  setSelectedAvailability([]);
                  setSearchQuery('');
                }}
                className="w-full bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/*products*/}
          <main className="flex-1">
            {/*search & sort bar*/}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] placeholder:text-[var(--input-border)] placeholder:opacity-70"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[var(--text)]">
                  {filteredProducts.length > 0 
                    ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} Products`
                    : ''
                  }
                </span>            
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-transparent border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)] cursor-pointer"
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
                <div className="col-span-5 flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-[var(--teal)]" />
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
                <p className="text-lg text-[var(--text)]">No products found matching your filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedTypes([]);
                    setSelectedAvailability([]);
                    setSearchQuery('');
                  }}
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
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 transition-colors ${
                    currentPage === 1
                      ? 'text-transparent'
                      : 'text-[var(--text)] hover:text-[var(--rust)]'
                  }`}
                >
                  ←
                </button>
                <span className="text-[var(--text)]">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 transition-colors ${
                    currentPage === totalPages
                      ? 'text-transparent'
                      : 'text-[var(--text)] hover:text-[var(--rust)]'
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