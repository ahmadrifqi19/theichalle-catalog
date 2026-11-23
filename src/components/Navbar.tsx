'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import { getStorefrontCategories } from '@/lib/categories';
import Image from 'next/image';

interface NavbarProps {
  categories?: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  instagramUrl?: string;
}

export default function Navbar({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  instagramUrl = 'https://instagram.com/theichalle',
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const categoryList = useMemo(() => getStorefrontCategories(categories), [categories]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (cat: string) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF6F0]/98 backdrop-blur-md shadow-xs border-b border-[#EADFCF]'
          : 'bg-[#FAF6F0] border-b border-[#EADFCF]/70'
      }`}
    >
      {/* Primary Brand & Actions Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 md:h-20">
        {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <a href="#" className="group flex items-center">
              <Image
                src="/logo.png"
                alt="The Ichalle - Timeless Women Wear"
                width={235}
                height={56}
                priority
                style={{ maxHeight: '56px', maxWidth: '235px', width: 'auto', height: 'auto' }}
                className="object-contain transition-opacity group-hover:opacity-90"
              />
            </a>
          </div>

          {/* Desktop category filters */}
          <nav className="hidden lg:flex flex-1 min-w-0 mx-3 items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap">
            {categoryList.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-2.5 py-1.5 text-[10px] uppercase tracking-wider transition-all rounded-full shrink-0 ${
                    isActive
                      ? 'bg-[#5C1A26] text-[#FAF6F0] font-medium shadow-xs'
                      : 'text-[#2B2625]/80 hover:text-[#5C1A26] hover:bg-[#F3ECE1]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Search + Instagram + Mobile Hamburger */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Desktop Search Input */}
            <div className="relative hidden md:block">
              <div className="flex items-center bg-[#F3ECE1]/70 border border-[#EADFCF] rounded-full px-3 py-1.5 focus-within:border-[#5C1A26] focus-within:bg-[#FAF6F0] transition-all w-44 focus-within:w-60">
                <Search className="w-3.5 h-3.5 text-[#2B2625]/50 shrink-0" />
                <input
                  type="text"
                  placeholder="Search pieces..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-transparent text-xs text-[#2B2625] placeholder-[#2B2625]/45 ml-2 w-full focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-[#2B2625]/40 hover:text-[#2B2625] text-xs ml-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#2B2625] md:hidden hover:text-[#5C1A26] active:bg-[#F3ECE1] rounded-full transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Instagram Social Link */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#2B2625]/80 hover:text-[#5C1A26] transition-colors rounded-full hover:bg-[#F3ECE1] active:bg-[#F3ECE1]"
              title="Follow @theichalle on Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2B2625] lg:hidden hover:text-[#5C1A26] active:bg-[#F3ECE1] rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expandable Drawer */}
        {searchOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-[#EADFCF]/60 animate-in fade-in duration-200">
            <div className="flex items-center bg-[#F3ECE1] border border-[#EADFCF] rounded-full px-3.5 py-1.5 shadow-inner">
              <Search className="w-3.5 h-3.5 text-[#2B2625]/50 shrink-0" />
              <input
                type="text"
                placeholder="Search collection (e.g. Silk, Dress, Linen)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent text-xs text-[#2B2625] placeholder-[#2B2625]/50 ml-2 w-full focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs text-[#2B2625]/60 hover:text-[#2B2625] px-1 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile and tablet category filters */}
      <div className="w-full border-t border-[#EADFCF]/50 bg-[#FAF6F0]/90 lg:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar whitespace-nowrap flex items-center gap-1.5 sm:gap-2">
          {categoryList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3 py-1 text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#5C1A26] text-[#FAF6F0] font-medium shadow-xs'
                    : 'bg-[#F3ECE1]/80 text-[#2B2625]/85 hover:bg-[#F3ECE1] hover:text-[#5C1A26] border border-[#EADFCF]/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[102px] bg-[#FAF6F0] border-b border-[#EADFCF] shadow-xl p-5 animate-in slide-in-from-top-2 duration-200 z-50">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#2B2625]/50 px-2 py-1 font-semibold">
              Browse Categories
            </span>
            {categoryList.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center justify-between text-left px-3.5 py-2.5 text-xs uppercase tracking-wider rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#5C1A26] text-[#FAF6F0] font-medium'
                      : 'text-[#2B2625] hover:bg-[#F3ECE1]'
                  }`}
                >
                  <span>{cat} Collection</span>
                  {isActive && <span className="text-xs">●</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#EADFCF] flex items-center justify-between px-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#5C1A26] font-medium"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>@theichalle</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="/admin"
              className="text-[11px] text-[#2B2625]/60 hover:text-[#5C1A26] uppercase tracking-wider"
            >
              Admin Portal
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
