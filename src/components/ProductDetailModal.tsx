'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { formatRupiah, buildWhatsAppOrderUrl } from '@/lib/format';
import { X, ZoomIn, ExternalLink, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  whatsappNumber?: string;
}

export default function ProductDetailModal({
  product,
  onClose,
  whatsappNumber = '6285882116161',
}: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
    const firstAvailableShadeIndex = product?.shades?.findIndex(
      (shade) => !product.sold_out_shades?.includes(shade)
    ) ?? -1;
    return firstAvailableShadeIndex >= 0 && firstAvailableShadeIndex < (product?.images.length ?? 0)
      ? firstAvailableShadeIndex
      : 0;
  });
  const [selectedShade, setSelectedShade] = useState<string>(
    () => product?.shades?.find((shade) => !product.sold_out_shades?.includes(shade)) ?? ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const sizes = product?.sizes ?? [];
    const initialShade = product?.shades?.find(
      (shade) => !product.sold_out_shades?.includes(shade)
    ) ?? '';
    return sizes.find((size) =>
      !product?.sold_out_shades?.includes(initialShade) &&
      !product?.sold_out_variants?.includes(`${initialShade}::${size}`)
    ) ?? sizes[0] ?? '';
  });
  const [isZoomed, setIsZoomed] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800'];

  const shades = product.shades ?? [];
  const soldOutShades = product.sold_out_shades ?? [];
  const isVariantSoldOut = (shade: string, size: string) =>
    Boolean(
      product.sold_out_shades?.includes(shade) ||
      product.sold_out_variants?.includes(`${shade}::${size}`)
    );
  const firstAvailableSizeForShade = (shade: string) =>
    product.sizes.find((size) => !isVariantSoldOut(shade, size));
  const handleSelectShade = (shade: string) => {
    setSelectedShade(shade);
    if (isVariantSoldOut(shade, selectedSize)) {
      const firstAvailableSize = firstAvailableSizeForShade(shade);
      if (firstAvailableSize) setSelectedSize(firstAvailableSize);
    }
  };
  const bust = product.size_guide?.variants?.[selectedSize]?.bust || product.size_guide?.bust;
  const length = product.size_guide?.variants?.[selectedSize]?.length || product.size_guide?.length;
  const handleSelectImageIndex = (index: number) => {
    const nextIndex = ((index % images.length) + images.length) % images.length;
    setSelectedImageIndex(nextIndex);

    const shade = shades[nextIndex];
    if (shade && !soldOutShades.includes(shade)) {
      handleSelectShade(shade);
    }
  };

  const currentImage = images[selectedImageIndex] || images[0];
  const hasDiscount = typeof product.discount_price === 'number' && product.discount_price < product.price;
  const activePrice = hasDiscount ? product.discount_price! : product.price;
  const isProductSoldOut = product.status === 'Sold Out' || product.status === 'sold_out';
  const currentPhotoShade = shades[selectedImageIndex];
  const isCurrentPhotoSoldOut =
    isProductSoldOut ||
    soldOutShades.includes(selectedShade) ||
    Boolean(currentPhotoShade && soldOutShades.includes(currentPhotoShade));
  const isSoldOut =
    product.status === 'Sold Out' || soldOutShades.includes(selectedShade) ||
    isVariantSoldOut(selectedShade, selectedSize);

  // WhatsApp CTA Link with pre-filled message
  const waUrl = buildWhatsAppOrderUrl({
    phone: whatsappNumber,
    productName: product.name,
    shade: selectedShade,
    size: selectedSize,
    price: activePrice,
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#2B2625]/65 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Lightbox Zoom Overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(false);
          }}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            aria-label="Close zoom"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-[85vh] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Main Modal / Mobile Bottom Sheet Card */}
      <div
        className="relative bg-[#FAF6F0] w-full max-h-[92vh] sm:max-w-4xl sm:rounded-sm rounded-t-2xl shadow-2xl border border-[#EADFCF] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 bg-[#2B2625]/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 p-2 text-[#2B2625]/70 hover:text-[#5C1A26] rounded-full hover:bg-[#F3ECE1] transition-all bg-[#FAF6F0]/80 sm:bg-transparent"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content (Photos + Details) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 md:p-8 overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {/* Left Column: Gallery */}
            <div className="flex flex-col space-y-2.5 sm:space-y-3">
              {/* Active Big Image */}
              <div className="relative aspect-[3/4] w-full max-h-[380px] sm:max-h-none bg-[#F3ECE1] rounded-sm overflow-hidden group cursor-zoom-in shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setIsZoomed(true)}
                />

                {isCurrentPhotoSoldOut && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#2B2625]/45 backdrop-blur-[1px]">
                    <span className="rounded-sm border border-[#FAF6F0]/50 bg-[#5C1A26]/90 px-4 py-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-[#FAF6F0]">
                      SOLD OUT
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-2.5 right-2.5 bg-[#FAF6F0]/90 text-[#2B2625] p-1.5 sm:p-2 rounded-full shadow-md text-xs flex items-center gap-1 transition-all"
                  title="Click to Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-[9px] sm:text-[10px] font-medium pr-0.5">Zoom</span>
                </button>

                {/* Left/Right Arrows for multi-images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectImageIndex(selectedImageIndex - 1);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#FAF6F0]/85 hover:bg-white text-[#2B2625] p-1.5 rounded-full shadow transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectImageIndex(selectedImageIndex + 1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FAF6F0]/85 hover:bg-white text-[#2B2625] p-1.5 rounded-full shadow transition-all active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((imgUrl, idx) => (
                  <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectImageIndex(idx)}
                      className={`relative aspect-[3/4] rounded-sm overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#5C1A26] ring-1 ring-[#5C1A26]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                      {(isProductSoldOut || Boolean(shades[idx] && soldOutShades.includes(shades[idx]))) && (
                        <span className="pointer-events-none absolute left-1 top-1 rounded-sm bg-[#5C1A26]/95 px-1 py-0.5 text-[7px] font-semibold tracking-wider text-[#FAF6F0] sm:text-[8px]">
                          SOLD OUT
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Information & Options */}
            <div className="flex flex-col">
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 pr-6 sm:pr-0">
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#5C1A26] font-medium">
                  {product.category}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F3ECE1] text-[#2B2625]">
                  {product.status}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-[#2B2625] mt-1.5 font-normal leading-snug">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-2.5 flex items-baseline gap-2.5 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-lg sm:text-2xl font-serif font-bold text-[#5C1A26]">
                      {formatRupiah(product.discount_price)}
                    </span>
                    <span className="text-xs sm:text-sm text-[#2B2625]/45 line-through">
                      {formatRupiah(product.price)}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#C2654A] bg-[#C2654A]/10 px-2 py-0.5 rounded">
                      Save {formatRupiah(product.price - product.discount_price!)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg sm:text-2xl font-serif font-semibold text-[#2B2625]">
                    {formatRupiah(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-[#2B2625]/80 leading-relaxed font-light">
                {product.description || "Crafted with precision from premium breathable fabrics, designed for effortless elegance and timeless appeal."}
              </p>

              {/* Shade Selection */}
              {shades.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#2B2625] font-semibold">
                      Shade: <span className="font-normal text-[#5C1A26]">{selectedShade}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {shades.map((shade, idx) => {
                    const isShadeSoldOut = soldOutShades.includes(shade);
                    return (
                    <button
                      key={shade}
                      type="button"
                      aria-label={isShadeSoldOut ? `${shade} (Sold Out)` : shade}
                      title={isShadeSoldOut ? 'Sold Out' : undefined}
                      onClick={() => {
                        handleSelectShade(shade);
                        if (idx < images.length) {
                          handleSelectImageIndex(idx);
                        }
                      }}
                      className={`px-3.5 py-1.5 text-xs border transition-all ${
                        selectedShade === shade
                          ? 'border-[#5C1A26] bg-[#5C1A26] text-[#FAF6F0]'
                          : 'border-[#EADFCF] bg-transparent text-[#2B2625] hover:border-[#5C1A26]/50'
                      } ${isShadeSoldOut ? 'opacity-70' : ''}`}
                    >
                      {shade}
                      {isShadeSoldOut && (
                        <span
                          aria-hidden="true"
                          className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50 align-middle"
                        />
                      )}
                    </button>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#2B2625] font-semibold">
                      Size: <span className="font-normal text-[#5C1A26]">{selectedSize}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      const isSizeSoldOut = isVariantSoldOut(selectedShade, size);
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={isSizeSoldOut}
                          aria-label={isSizeSoldOut ? `${size} (Sold Out)` : size}
                          title={isSizeSoldOut ? 'Sold Out' : undefined}
                          onClick={() => setSelectedSize(size)}
                          className={`text-[11px] sm:text-xs px-3 py-1 rounded border transition-all ${
                            isSizeSoldOut
                              ? 'bg-[#F3ECE1]/60 border-dashed border-[#2B2625]/25 text-[#2B2625]/35 line-through opacity-45 cursor-not-allowed'
                              : isSelected
                                ? 'bg-[#2B2625] text-[#FAF6F0] border-[#2B2625] shadow-xs font-medium active:scale-95'
                                : 'bg-[#FAF6F0] text-[#2B2625] border-[#EADFCF] hover:border-[#2B2625] active:scale-95'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Guide & Fabric Box */}
              {product.size_guide && (
                <div className="mt-4 sm:mt-5 p-3 bg-[#F3ECE1]/70 rounded-sm border border-[#EADFCF] text-[11px] sm:text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#5C1A26] font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] mb-1">
                    <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Garment Specification</span>
                  </div>
                  {bust && (
                    <div className="flex justify-between text-[#2B2625]/85">
                      <span className="text-[#2B2625]/60">Bust / LD:</span>
                      <span className="font-medium">{bust}</span>
                    </div>
                  )}
                  {length && (
                    <div className="flex justify-between text-[#2B2625]/85">
                      <span className="text-[#2B2625]/60">Length / PB:</span>
                      <span className="font-medium">{length}</span>
                    </div>
                  )}
                  {product.size_guide.fabric && (
                    <div className="flex justify-between text-[#2B2625]/85">
                      <span className="text-[#2B2625]/60">Fabric:</span>
                      <span className="font-medium truncate ml-2">{product.size_guide.fabric}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-center text-[#2B2625]/50 tracking-wide mt-3 hidden sm:block">
                Direct styling consultation & personalized assistance with our concierge team.
              </p>
            </div>
          </div>
        </div>

{/* STICKY BOTTOM ACTION BAR */}
        <div className="sticky bottom-0 bg-[#FAF6F0] border-t border-[#EADFCF] p-3 sm:p-4 shadow-lg z-20 shrink-0 space-y-2">
          {/* Primary: Order via WhatsApp */}
          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => window.open(waUrl, '_blank', 'noopener,noreferrer')}
            className={`w-full py-3 sm:py-3.5 px-4 rounded text-xs sm:text-sm uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              isSoldOut
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0]'
            }`}
          >
            <svg
              viewBox="0 0 32 32"
              fill={isSoldOut ? '#6B7280' : '#FAF6F0'}
              style={{ fill: isSoldOut ? '#6B7280' : '#FAF6F0' }}
              className="w-4 h-4 shrink-0"
              aria-hidden="true"
            >
              <path
                fill={isSoldOut ? '#6B7280' : '#FAF6F0'}
                d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16.004c0 2.35.614 4.644 1.78 6.666L2.667 29.333l6.835-1.792a13.28 13.28 0 0 0 6.502 1.696h.006c7.363 0 13.333-5.973 13.333-13.337 0-3.562-1.387-6.912-3.906-9.431a13.246 13.246 0 0 0-9.433-3.802zm0 24.316h-.005a11.06 11.06 0 0 1-5.637-1.544l-.404-.24-4.056 1.063 1.083-3.954-.263-.419a11.045 11.045 0 0 1-1.696-5.885c0-6.11 4.971-11.081 11.084-11.081 2.96 0 5.743 1.154 7.835 3.248a11.01 11.01 0 0 1 3.243 7.838c0 6.111-4.973 11.074-11.084 11.074zm6.078-8.299c-.333-.167-1.971-.973-2.276-1.084-.305-.111-.528-.167-.75.167-.222.333-.861 1.084-1.055 1.306-.195.222-.389.25-.722.083-.333-.167-1.407-.519-2.68-1.654-.991-.884-1.66-1.975-1.855-2.308-.194-.333-.021-.513.146-.679.15-.149.333-.389.5-.583.167-.195.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.806-1.028-2.473-.27-.649-.545-.561-.75-.571l-.639-.011c-.222 0-.583.083-.889.417-.305.333-1.167 1.139-1.167 2.778s1.195 3.223 1.361 3.445c.167.222 2.351 3.59 5.695 5.034.796.344 1.417.549 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.971-.806 2.249-1.584.278-.778.278-1.445.194-1.584-.083-.139-.305-.222-.639-.389z"
              />
            </svg>
            <span>{isSoldOut ? 'SOLD OUT' : 'ORDER VIA WHATSAPP'}</span>
          </button>
          
          {/* Secondary: Buy on Marketplace */}
          {product.marketplace_url && (
            <a
              href={product.marketplace_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded border border-[#5C1A26] text-[#5C1A26] hover:bg-[#5C1A26] hover:text-[#FAF6F0] text-[11px] sm:text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
            >
              <span>Buy on Shopee / TikTok</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
