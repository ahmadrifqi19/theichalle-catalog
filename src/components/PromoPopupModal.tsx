'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface PromoPopupModalProps {
  isActive?: boolean;
  imageUrl?: string | null;
  redirectLink?: string | null;
}

const STORAGE_KEY = 'ichalle_promo_dismissed';

export default function PromoPopupModal({
  isActive = false,
  imageUrl,
  redirectLink,
}: PromoPopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only proceed if active and image URL is provided
    if (!isActive || !imageUrl) return;

    // Check if already dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (isDismissed === 'true') {
        return;
      }
    } catch {
      // Ignore sessionStorage access errors (e.g., privacy/iframe mode)
    }

    // Delay 800ms for smooth entrance after page loads
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [isActive, imageUrl]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  const handlePosterClick = () => {
    handleDismiss();

    if (!redirectLink) {
      // Default: scroll to catalog if no link specified
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (redirectLink.startsWith('#')) {
      const targetEl = document.querySelector(redirectLink);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (redirectLink.startsWith('http')) {
      window.open(redirectLink, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = redirectLink;
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Promotional Announcement"
    >
      {/* Modal Container */}
      <div
        className="relative max-w-[340px] sm:max-w-[420px] w-full rounded-2xl overflow-hidden shadow-2xl bg-[#FAF6F0] border border-[#EADFCF]/60 flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button at Top-Right */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
          aria-label="Close promotion banner"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Poster Image Container */}
        <div
          onClick={handlePosterClick}
          className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden group select-none bg-[#F3ECE1]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="The Ichalle Promotional Offer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />

          {/* Soft Bottom Overlay & Click Hint */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#FAF6F0]" />
              <span>Special Offer</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-[#5C1A26] text-[#FAF6F0] px-3 py-1 rounded-full font-medium shadow">
              {redirectLink && !redirectLink.startsWith('#') ? 'Shop Now →' : 'Explore →'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
