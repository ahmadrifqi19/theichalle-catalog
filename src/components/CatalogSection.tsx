'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { ArrowUpDown, Check, Filter } from 'lucide-react';

interface CatalogSectionProps {
  products: Product[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
}

type SortOption = 'latest' | 'price-asc' | 'price-desc';

export default function CatalogSection({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSelectProduct,
}: CatalogSectionProps) {
  const [readyStockOnly, setReadyStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchCategory = p.category.toLowerCase().includes(query);
          const matchShades = p.shades?.some((s) => s.toLowerCase().includes(query));
          const matchDesc = p.description?.toLowerCase().includes(query);
          if (!matchName && !matchCategory && !matchShades && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (activeCategory === 'New Arrivals') {
          const isNewArrival =
            p.status === 'new' || p.status === 'New Arrival' || p.is_featured === true;
          if (!isNewArrival) return false;
        } else if (activeCategory === 'Sale') {
          const isSale =
            p.discount_price !== null &&
            typeof p.discount_price === 'number' &&
            Number.isFinite(p.discount_price) &&
            p.discount_price < p.price;
          if (!isSale) return false;
        } else if (activeCategory !== 'All') {
          if (p.category.toLowerCase() !== activeCategory.toLowerCase()) {
            return false;
          }
        }

        // Ready Stock Only Toggle
        if (readyStockOnly) {
          if (p.status !== 'Ready Stock') {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const getEffectivePrice = (item: Product) =>
          typeof item.discount_price === 'number' && item.discount_price > 0
            ? item.discount_price
            : item.price;

        if (sortBy === 'price-asc') {
          return getEffectivePrice(a) - getEffectivePrice(b);
        }
        if (sortBy === 'price-desc') {
          return getEffectivePrice(b) - getEffectivePrice(a);
        }
        return 0;
      });
  }, [products, activeCategory, searchQuery, readyStockOnly, sortBy]);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-14 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#C2654A] font-semibold">
          Curated Wardrobe
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2B2625] font-normal mt-0.5">
          The Curated Catalog
        </h2>
        <div className="w-10 sm:w-12 h-0.5 bg-[#5C1A26] mx-auto mt-2 sm:mt-3" />
      </div>

      {/* Catalog controls */}
      <div className="flex justify-between items-center gap-3 border-b border-[#EADFCF] pb-4 mb-5 sm:mb-8">
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs w-full">
          {/* Ready Stock Only Toggle */}
          <button
            type="button"
            onClick={() => setReadyStockOnly(!readyStockOnly)}
            className="flex items-center gap-1.5 cursor-pointer select-none text-[#2B2625] py-1"
          >
            <div
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border flex items-center justify-center transition-colors ${
                readyStockOnly
                  ? 'bg-[#5C1A26] border-[#5C1A26] text-[#FAF6F0]'
                  : 'border-[#2B2625]/40 bg-[#FAF6F0]'
              }`}
            >
              {readyStockOnly && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
            </div>
            <span className="font-medium text-[10px] sm:text-[11px] tracking-wide uppercase">
              Ready Stock
            </span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-[#F3ECE1]/70 border border-[#EADFCF] rounded px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-[#2B2625]/60 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[11px] sm:text-xs text-[#2B2625] font-medium focus:outline-none cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Active Filter Indicator */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 text-[11px] sm:text-xs text-[#2B2625]/60 px-0.5">
        <div>
          Showing <span className="font-semibold text-[#2B2625]">{filteredProducts.length}</span> pieces
          {searchQuery && (
            <span> matching &ldquo;<span className="text-[#5C1A26] font-medium">{searchQuery}</span>&rdquo;</span>
          )}
          {activeCategory !== 'All' && (
            <span> in <span className="text-[#5C1A26] font-medium">{activeCategory}</span></span>
          )}
        </div>
      </div>

      {/* 2-Column Mobile, 4-Column Desktop Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-14 sm:py-20 text-center flex flex-col items-center justify-center bg-[#F3ECE1]/40 rounded-sm border border-dashed border-[#EADFCF] p-6">
          <Filter className="w-8 h-8 text-[#5C1A26]/40 mb-2" />
          <h3 className="font-serif text-lg sm:text-xl text-[#2B2625] font-normal">
            No matching pieces found
          </h3>
          <p className="text-xs text-[#2B2625]/60 mt-1 max-w-sm">
            Try adjusting your search or category filter.
          </p>
          <button
            onClick={() => {
              onSelectCategory('All');
              setReadyStockOnly(false);
            }}
            className="mt-4 text-[11px] sm:text-xs uppercase tracking-widest bg-[#5C1A26] text-[#FAF6F0] px-4 py-2 rounded-full hover:bg-[#46121C] transition-colors active:scale-95"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
