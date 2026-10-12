import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = ['All', 'Food & Groceries', 'Clothing', 'Home Decor', 'Footwear', 'Handicrafts'];

export const ProductsPage: React.FC = () => {
  const { catalog, catalogLoading, catalogError, fetchCatalog } = useProductStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch]       = useState(searchParams.get('search') ?? '');
  const [category, setCategory]   = useState(searchParams.get('category') ?? '');
  const [sortBy, setSortBy]       = useState(searchParams.get('sort_by') ?? 'created_at');
  const [sortDir, setSortDir]     = useState(searchParams.get('sort_dir') ?? 'desc');
  const [page, setPage]           = useState(Number(searchParams.get('page') ?? 1));

  const doFetch = useCallback(() => {
    const filters = {
      search: search || undefined,
      category: category || undefined,
      sort_by: sortBy as 'name' | 'price_in_paisa' | 'created_at',
      sort_dir: sortDir as 'asc' | 'desc',
      per_page: 12,
      page,
    };

    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (category) params.category = category;
    if (sortBy) params.sort_by = sortBy;
    if (sortDir) params.sort_dir = sortDir;
    setSearchParams(params, { replace: true });

    fetchCatalog(filters);
  }, [search, category, sortBy, sortDir, page, fetchCatalog, setSearchParams]);

  useEffect(() => { doFetch(); }, [doFetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryClick = (cat: string) => {
    const target = cat === 'All' ? '' : cat;
    setCategory(prev => (prev === target ? '' : target));
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Header & Department Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#E9DCE4]">
        <div>
          <span className="text-xs text-stone-500 font-medium">MiniStore Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            {category || 'All Artisan Collections'}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {catalog ? `${catalog.total} authentic items available` : 'Explore all store items.'}
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        {CATEGORIES.map(cat => {
          const isSelected = (cat === 'All' && !category) || category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#03081E] text-white shadow-md shadow-black/20'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-[#03081E] hover:text-[#03081E] shadow-xs'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9DCE4] rounded-full text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#F45CAB] transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#03081E] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#F45CAB] transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-stone-400" />
          <select
            value={`${sortBy}:${sortDir}`}
            onChange={e => {
              const [by, dir] = e.target.value.split(':');
              setSortBy(by);
              setSortDir(dir);
              setPage(1);
            }}
            className="border border-[#E9DCE4] rounded-full text-xs sm:text-sm px-4 py-2.5 bg-white text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#F45CAB]"
          >
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
            <option value="price_in_paisa:asc">Price: Low to High</option>
            <option value="price_in_paisa:desc">Price: High to Low</option>
            <option value="name:asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {catalogError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm">
          {catalogError}
        </div>
      )}

      {/* Loading state */}
      {catalogLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-[#F45CAB] animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!catalogLoading && catalog?.data.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E9DCE4] space-y-3">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-stone-700 font-bold text-base">No products found</p>
          <p className="text-stone-400 text-xs max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different category filter.
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!catalogLoading && catalog && catalog.data.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {catalog.data.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {catalog.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-stone-600 px-3">
                Page {catalog.current_page} of {catalog.last_page}
              </span>

              <button
                disabled={page >= catalog.last_page}
                onClick={() => setPage(p => Math.min(catalog.last_page, p + 1))}
                className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
