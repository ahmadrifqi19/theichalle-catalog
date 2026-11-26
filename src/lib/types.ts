export interface SizeGuide {
  bust?: string; // LD (Lingkar Dada)
  length?: string; // PB (Panjang Baju)
  fabric?: string;
  variants?: Record<string, { bust: string; length: string }>;
}

export type ProductStatus = 'Ready Stock' | 'Pre-Order' | 'Sold Out' | 'sold_out' | 'New Arrival' | 'new';

export interface Product {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  discount_price?: number | null;
  images: string[];
  shades: string[];
  sold_out_shades?: string[];
  sold_out_variants?: string[];
  sizes: string[];
  size_guide?: SizeGuide;
  status: ProductStatus;
  is_featured: boolean;
  marketplace_url?: string | null;
  custom_badge?: string | null;
}

export interface StoreSettings {
  id: number;
  created_at?: string;
  updated_at?: string;
  announcement_text: string;
  announcement_enabled: boolean;
  hero_eyebrow?: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  whatsapp_number: string;
  instagram_url: string;
  tiktok_url: string;
  shopee_url: string;
  gmaps_url: string;
  ecatalogue_url: string;
  store_address: string;
  about_us: string;
  terms_conditions: string;
  privacy_policy: string;
  refund_policy: string;
  promo_popup_active?: boolean;
  promo_popup_image_url?: string | null;
  promo_popup_link?: string | null;
  categories?: string[];
}

