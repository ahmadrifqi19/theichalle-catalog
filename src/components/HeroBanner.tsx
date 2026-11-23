'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  onExploreClick?: () => void;
}

export default function HeroBanner({
  title = "Timeless Elegance, Effortlessly Worn.",
  subtitle = "Thoughtfully designed silhouettes and curated luxury fabrics for the modern, graceful woman.",
  imageUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
  onExploreClick,
}: HeroBannerProps) {
  const handleScrollToCatalog = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full min-h-[420px] sm:min-h-[540px] md:min-h-[640px] flex items-center justify-center overflow-hidden bg-[#FAF6F0]">
      {/* Background Hero Image with Explicit relative & absolute styling */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="The Ichalle Collection Hero"
          loading="eager"
          className="w-full h-full object-cover object-center filter brightness-[0.88]"
        />
        {/* Soft Editorial Warm Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2625]/85 via-[#2B2625]/40 to-[#2B2625]/15" />
        <div className="absolute inset-0 bg-[#5C1A26]/15 mix-blend-multiply" />
      </div>

      {/* Hero Content - Perfectly Fitted Above the Fold on Mobile */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-[#FAF6F0] flex flex-col items-center py-8 sm:py-12">
        <span className="inline-block uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[10px] sm:text-xs font-medium text-[#F3ECE1] mb-2 sm:mb-4 border-b border-[#F3ECE1]/40 pb-0.5">
          Editorial Edition
        </span>

        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-wide drop-shadow-sm max-w-2xl px-2">
          {title}
        </h1>

        <p className="mt-2.5 sm:mt-4 text-xs sm:text-base md:text-lg text-[#F3ECE1]/90 font-light max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none px-4">
          {subtitle}
        </p>

        {/* CTA Button */}
        <div className="mt-6 sm:mt-8 flex items-center">
          <button
            onClick={handleScrollToCatalog}
            className="group inline-flex items-center gap-2.5 bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-6 sm:px-8 py-2.5 sm:py-3.5 text-[11px] sm:text-xs uppercase tracking-[0.18em] font-medium rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-[#FAF6F0]/25"
          >
            <span>Explore Collection</span>
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      </div>

      {/* Subtle Bottom Curved Separation */}
      <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-10 bg-gradient-to-t from-[#FAF6F0] to-transparent pointer-events-none" />
    </section>
  );
}
