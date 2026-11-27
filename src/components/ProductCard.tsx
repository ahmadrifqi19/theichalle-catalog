'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import { parseProductImage } from '@/lib/product-images';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0]
    ? parseProductImage(product.images[0]).url
    : 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800';
  const secondaryImage = product.images?.[1]
    ? parseProductImage(product.images[1]).url
    : primaryImage;
  const hasSecondaryImage = product.images && product.images.length > 1;

  const isSoldOut = product.status === 'Sold Out' || product.status === 'sold_out';
  const hasDiscount = typeof product.discount_price === 'number' && product.discount_price < product.price;

  // Determine status badge display with strict priority order:
  // 1. Sold Out -> 2. Custom Badge -> 3. Sale -> 4. Default Status
  const renderBadge = () => {
    if (isSoldOut) {
      return (
        <span className="bg-[#2B2625]/85 text-[#FAF6F0] text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm shadow-xs backdrop-blur-xs">
          SOLD OUT
        </span>
      );
    }
    if (product.custom_badge && product.custom_badge.trim()) {
      return (
        <span className="bg-[#5C1A26] text-[#FAF6F0] text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm shadow-xs flex items-center gap-1">
          <span>{product.custom_badge.trim()}</span>
        </span>
      );
    }
    if (hasDiscount) {
      const discountPercent = product.price > 0
        ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
        : 0;
      return (
        <span className="bg-[#C2654A] text-[#FAF6F0] text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm shadow-xs">
          SALE -{discountPercent}%
        </span>
      );
    }
    if (product.status === 'New Arrival') {
      return (
        <span className="bg-[#5C1A26] text-[#FAF6F0] text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm shadow-xs">
          New Arrival
        </span>
      );
    }
    if (product.status === 'Pre-Order') {
      return (
        <span className="bg-[#B8860B] text-[#FAF6F0] text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm shadow-xs">
          Pre-Order
        </span>
      );
    }
    if (product.status === 'Ready Stock') {
      return (
        <span className="bg-[#2B2625]/70 text-[#FAF6F0] text-[8.5px] sm:text-[9.5px] tracking-wider uppercase font-medium px-1.5 py-0.5 rounded-sm backdrop-blur-xs">
          Ready Stock
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col transition-all duration-300 active:scale-[0.98] select-none"
    >
      {/* 3:4 Aspect Ratio Image Container with Explicit relative positioning */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3ECE1] rounded-sm shadow-xs">
        {/* Primary Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-top transition-all duration-700 ease-out ${
            isHovered && hasSecondaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          } ${isSoldOut ? 'grayscale-[60%] brightness-95' : ''}`}
        />

        {/* Secondary Image (Smooth Cross-fade on Hover) */}
        {hasSecondaryImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out absolute inset-0 ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            } ${isSoldOut ? 'grayscale-[60%] brightness-95' : ''}`}
          />
        )}

        {/* Status Badge in Top-Left */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
          {renderBadge()}
        </div>

        {/* Quick View Button Hover overlay (Desktop only) */}
        <div className="hidden sm:flex absolute inset-0 bg-[#2B2625]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center p-3 pointer-events-none">
          <button
            className="w-full bg-[#FAF6F0]/95 hover:bg-white text-[#5C1A26] py-1.5 px-3 rounded text-[10px] uppercase tracking-widest font-medium flex items-center justify-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-2 sm:mt-3 flex flex-col flex-grow">
        {/* Category & Shades count */}
        <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-[#2B2625]/60 uppercase tracking-wider mb-0.5">
          <span className="truncate">{product.category}</span>
          {product.shades && product.shades.length > 0 && (
            <span className="shrink-0">{product.shades.length} shades</span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-serif text-xs sm:text-sm md:text-base text-[#2B2625] group-hover:text-[#5C1A26] transition-colors line-clamp-1 sm:line-clamp-2 font-medium leading-snug">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-xs sm:text-sm font-semibold text-[#5C1A26]">
                {formatRupiah(product.discount_price)}
              </span>
              <span className="text-[10px] sm:text-xs text-[#2B2625]/45 line-through">
                {formatRupiah(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-medium text-[#2B2625]">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
