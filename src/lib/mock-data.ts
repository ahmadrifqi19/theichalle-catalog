import { Product, StoreSettings } from './types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 1,
  announcement_text: "✨ Complimentary shipping for orders above Rp 500.000 | Discover the New Spring/Summer Collection",
  announcement_enabled: true,
  hero_title: "Timeless Elegance, Effortlessly Worn.",
  hero_subtitle: "Thoughtfully designed silhouettes and curated luxury fabrics for the modern, graceful woman.",
  hero_image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
  whatsapp_number: "6281234567890",
  instagram_url: "https://instagram.com/theichalle",
  tiktok_url: "https://tiktok.com/@theichalle",
  shopee_url: "https://shopee.co.id/theichalle",
  gmaps_url: "https://maps.google.com/?q=The+Ichalle+Boutique+Jakarta",
  ecatalogue_url: "https://drive.google.com",
  store_address: "Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190",
  about_us: `The Ichalle Collection was founded with a singular devotion: creating timeless, elegant attire for women who value grace, modesty, and impeccable craftsmanship. 

Every stitch, fold, and silhouette is meticulously developed using premium breathable fabrics that drape effortlessly. We believe elegance is not about standing out, but about being remembered. Our pieces are tailored to transition seamlessly from intimate gatherings to formal celebrations.`,
  terms_conditions: `1. Ordering & Reservation: Orders are received 24/7. Inquiries and order confirmations are assisted by our styling concierge Monday to Saturday (09:00 - 18:00 WIB).
2. Payment: Payment confirmation must be settled within 24 hours of invoice issuance. Unconfirmed reservations will be automatically released back to inventory.
3. Color Accuracy: Every photo is captured under studio balanced lighting. Due to natural screen calibration variations on individual devices, actual color nuances may present a 3-5% difference.
4. Measurements: Due to bespoke cutting and artisanal hand-finishing, slight variations within 1-2 cm are natural.`,
  privacy_policy: `At The Ichalle Collection, we respect and safeguard the privacy of every client.

All personal information provided during inquiries and orders (name, contact number, shipping destination, and size preferences) is held in strict confidence. This data is exclusively utilized to fulfill your orders, provide dedicated customer assistance, and deliver exclusive collection announcements. We never disclose, sell, or rent your details to third parties.`,
  refund_policy: `We take tremendous pride in our artisanal craftsmanship and inspect each garment thoroughly prior to delivery.

Should you receive a garment that does not meet our rigorous standards:
1. Contact our WhatsApp concierge within 48 hours of carrier package delivery.
2. The garment must remain in unworn, unwashed condition with all original The Ichalle tags and packaging intact.
3. An uncut continuous unboxing video is required to process any exchange or reimbursement claims.
4. Exchanges for alternate sizes are welcome subject to stock availability.`,
  promo_popup_active: true,
  promo_popup_image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
  promo_popup_link: "#catalog",
  categories: ["Blouses", "Dresses", "Sets", "Outerwear", "Skirts"],
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aurelia Pleated Silk Blouse",
    slug: "aurelia-pleated-silk-blouse",
    category: "Blouses",
    price: 389000,
    discount_price: 349000,
    description: "An ethereal drape crafted from lightweight silk crepe with delicate pleating along the neckline and romantic cuff detailing. Perfect for understated sophistication.",
    images: [
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Oatmeal Beige", "Burgundy Plum", "Soft Pearl"],
    sizes: ["S/M", "L/XL"],
    size_guide: {
      bust: "98 - 104 cm",
      length: "72 cm",
      fabric: "Premium Mulberry Silk Crepe"
    },
    status: "Ready Stock",
    is_featured: true,
    marketplace_url: "https://shopee.co.id"
  },
  {
    id: "prod-2",
    name: "Seraphina Tiered Maxi Dress",
    slug: "seraphina-tiered-maxi-dress",
    category: "Dresses",
    price: 549000,
    discount_price: null,
    description: "A sweeping tiered maxi dress featuring fluid movement, gentle gathers, and a subtle Mandarin collar. Drapes gracefully with modesty and poise.",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Dusty Terracotta", "Midnight Onyx", "Sage Green"],
    sizes: ["All Size (Fit to XL)"],
    size_guide: {
      bust: "106 cm",
      length: "138 cm",
      fabric: "Textured Rayon Twill Premium"
    },
    status: "New Arrival",
    is_featured: true,
    marketplace_url: "https://shopee.co.id"
  },
  {
    id: "prod-3",
    name: "Genevieve Embroidered Set",
    slug: "genevieve-embroidered-set",
    category: "Sets",
    price: 689000,
    discount_price: 620000,
    description: "A two-piece coordinated set consisting of a softly tailored tunic with tone-on-tone botanical thread embroidery and straight relaxed-fit trousers.",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Warm Cream", "Deep Burgundy"],
    sizes: ["S", "M", "L"],
    size_guide: {
      bust: "102 cm",
      length: "Top: 85 cm / Pants: 98 cm",
      fabric: "Pure Linen & Cotton Slub Blend"
    },
    status: "Ready Stock",
    is_featured: true,
    marketplace_url: "https://shopee.co.id"
  },
  {
    id: "prod-4",
    name: "Celeste Satin Bias Cut Midi",
    slug: "celeste-satin-bias-cut-midi",
    category: "Dresses",
    price: 479000,
    discount_price: null,
    description: "Sculpted on the bias for a natural fluid drape that flatters the silhouette without clinging. Finished with French seams and an invisible back zipper.",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Champagne Gold", "Espresso Brown", "Rosé Taupe"],
    sizes: ["S", "M", "L"],
    size_guide: {
      bust: "94 - 100 cm",
      length: "125 cm",
      fabric: "Heavyweight Japanese Matte Satin"
    },
    status: "Ready Stock",
    is_featured: false,
    marketplace_url: "https://shopee.co.id"
  },
  {
    id: "prod-5",
    name: "Vivienne Classic Linen Blouse",
    slug: "vivienne-classic-linen-blouse",
    category: "Blouses",
    price: 329000,
    discount_price: 289000,
    description: "An everyday wardrobe anchor featuring mother-of-pearl buttons, dropped shoulders, and a relaxed boxy cut that exudes effortless chic.",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Pure Ivory", "Terracotta Ochre", "Olive Khaki"],
    sizes: ["All Size"],
    size_guide: {
      bust: "110 cm",
      length: "68 cm",
      fabric: "100% European Flax Linen"
    },
    status: "Ready Stock",
    is_featured: false,
    marketplace_url: "https://shopee.co.id"
  },
  {
    id: "prod-6",
    name: "Kallista Draped Kimono Outer",
    slug: "kallista-draped-kimono-outer",
    category: "Outerwear",
    price: 419000,
    discount_price: null,
    description: "A versatile layering statement featuring kimono-inspired wide sleeves, sash belt, and side slits that add drama and grace to any minimal outfit.",
    images: [
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Deep Burgundy", "Camel Tan"],
    sizes: ["All Size"],
    size_guide: {
      bust: "Open Bust (Up to 120 cm)",
      length: "115 cm",
      fabric: "Soft Twill Rayon Jacquard"
    },
    status: "Pre-Order",
    is_featured: true,
    marketplace_url: "https://shopee.co.id"
  },
  {
    id: "prod-7",
    name: "Rosalind Organza Festive Dress",
    slug: "rosalind-organza-festive-dress",
    category: "Dresses",
    price: 749000,
    discount_price: 699000,
    description: "Exquisite layered organza with handcrafted floral lace applique on the bodice and a full flared skirt. Designed for your most cherished occasions.",
    images: [
      "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Soft Blush", "Misty Lilac"],
    sizes: ["S", "M", "L", "XL"],
    size_guide: {
      bust: "96 cm (S) / 102 cm (M) / 108 cm (L)",
      length: "140 cm",
      fabric: "Fine Glass Organza with Cotton Voile Lining"
    },
    status: "Sold Out",
    is_featured: false,
    marketplace_url: null
  },
  {
    id: "prod-8",
    name: "Eleanor Linen Culotte Set",
    slug: "eleanor-linen-culotte-set",
    category: "Sets",
    price: 520000,
    discount_price: 450000,
    description: "Sleeveless square-neck top paired with high-waisted wide-leg cropped culottes. Breezy, relaxed, yet instantly polished.",
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1000&auto=format&fit=crop"
    ],
    shades: ["Natural Ecru", "Olive Mist"],
    sizes: ["S/M", "L/XL"],
    size_guide: {
      bust: "100 cm",
      length: "Top: 55 cm / Pants: 88 cm",
      fabric: "Washed Pure Linen"
    },
    status: "Ready Stock",
    is_featured: false,
    marketplace_url: "https://shopee.co.id"
  }
];

