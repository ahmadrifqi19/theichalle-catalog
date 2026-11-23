'use client';

import React, { useState, useEffect } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import CatalogSection from '@/components/CatalogSection';
import ProductDetailModal from '@/components/ProductDetailModal';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import PromoPopupModal from '@/components/PromoPopupModal';
import { Product, StoreSettings } from '@/lib/types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '@/lib/mock-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured()) {
        setSettings(DEFAULT_STORE_SETTINGS);
        setProducts(INITIAL_PRODUCTS);
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // 1. Fetch Store Settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (!settingsError && settingsData) {
          setSettings(settingsData as StoreSettings);
        } else {
          setSettings(DEFAULT_STORE_SETTINGS);
        }

        // 2. Fetch Products (mengikuti data live meskipun 0 produk)
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!productsError && productsData) {
          setProducts(productsData as Product[]);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } catch (err) {
        console.warn('Error fetching Supabase storefront data, using fallback:', err);
        setSettings(DEFAULT_STORE_SETTINGS);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5C1A26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#2B2625]">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar
        text={settings.announcement_text}
        enabled={settings.announcement_enabled}
      />

      {/* 2. Sticky Navbar */}
      <Navbar
        categories={settings.categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        instagramUrl={settings.instagram_url}
      />

      {/* 3. Hero Banner Section */}
      <main className="flex-grow">
        <HeroBanner
          title={settings.hero_title}
          subtitle={settings.hero_subtitle}
          imageUrl={settings.hero_image_url}
        />

        {/* 4. Catalog Grid Section */}
        <CatalogSection
          products={products}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSelectProduct={setSelectedProduct}
        />
      </main>

      {/* 5. Product Detail Modal (dengan key agar reset state otomatis tanpa error ESLint) */}
      <ProductDetailModal
        key={selectedProduct?.id ?? 'closed'}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={settings.whatsapp_number}
      />

      {/* 6. Footer Section */}
      <Footer
        settings={settings}
        onSelectCategory={setActiveCategory}
      />

      {/* 7. Floating WhatsApp Concierge Button */}
      <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />

      {/* 8. Promotional Pop-up Banner (Welcome Modal) */}
      <PromoPopupModal
        isActive={settings.promo_popup_active}
        imageUrl={settings.promo_popup_image_url}
        redirectLink={settings.promo_popup_link}
      />
    </div>
  );
}