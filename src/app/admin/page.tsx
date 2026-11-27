'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Product, StoreSettings, ProductStatus } from '@/lib/types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '@/lib/mock-data';
import { DEFAULT_CATEGORIES } from '@/lib/categories';
import { formatRupiah } from '@/lib/format';
import { formatProductImage, parseProductImage } from '@/lib/product-images';
import { compressProductImage } from '@/lib/image-compression';
import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  Store,
  Upload,
  CheckCircle,
  AlertCircle,
  Save,
  Search,
  SlidersHorizontal,
  X,
  Package,
  Sparkles,
} from 'lucide-react';

interface ManageCategoriesPanelProps {
  categories: string[];
  isSaving: boolean;
  onAdd: (category: string) => Promise<boolean>;
  onRemove: (category: string) => Promise<boolean>;
}

function ManageCategoriesPanel({
  categories,
  isSaving,
  onAdd,
  onRemove,
}: ManageCategoriesPanelProps) {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = async () => {
    if (isSaving || !newCategory.trim()) return;
    if (await onAdd(newCategory)) setNewCategory('');
  };

  const handleRemove = async (category: string) => {
    if (!confirm(`Hapus kategori "${category}"?`)) return;
    await onRemove(category);
  };

  return (
    <section className="bg-[#FAF6F0] p-4 sm:p-5 rounded-sm border border-[#EADFCF] shadow-xs space-y-3">
      <div>
        <h3 className="font-serif text-base sm:text-lg text-[#2B2625]">Manage Categories</h3>
        <p className="text-[10px] sm:text-[11px] text-[#2B2625]/60">
          Kategori ini digunakan sebagai filter katalog dan pilihan produk.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              void handleAdd();
            }
          }}
          placeholder="Nama kategori baru"
          aria-label="Nama kategori baru"
          className="min-w-0 flex-1 px-3 py-2 bg-white border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={isSaving || !newCategory.trim()}
          className="px-3 py-2 bg-[#5C1A26] text-[#FAF6F0] rounded text-xs font-medium disabled:opacity-50"
        >
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.length > 0 ? categories.map((category, index) => (
          <span
            key={`${category.toLowerCase()}-${index}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F3ECE1] border border-[#EADFCF] rounded-full text-xs text-[#2B2625]"
          >
            {category}
            <button
              type="button"
              onClick={() => handleRemove(category)}
              disabled={isSaving}
              aria-label={`Hapus kategori ${category}`}
              className="text-[#2B2625]/55 hover:text-red-700 disabled:opacity-50"
            >
              ×
            </button>
          </span>
        )) : (
          <p className="text-xs text-[#2B2625]/60">Belum ada kategori. Tambahkan kategori pertama.</p>
        )}
      </div>
    </section>
  );
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
};

const createTemporaryProductId = () => `prod-${Date.now()}`;

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication & session state
  const [, setCurrentUserEmail] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');

  // Products & Settings State
  const [products, setProducts] = useState<Product[]>(() => {
    return isSupabaseConfigured() ? [] : INITIAL_PRODUCTS;
  });
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);

  // Filter & Search in Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('All');

  // Add / Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    category: string;
    price: number;
    discount_price: number | '' | null;
    description: string;
    images: string[];
    shadesInput: string;
    soldOutShades: string[];
    sizesInput: string;
    bust: string;
    length: string;
    fabric: string;
    custom_badge: string;
    status: ProductStatus;
    is_featured: boolean;
    marketplace_url: string;
  }>({
    name: '',
    category: DEFAULT_CATEGORIES[0],
    price: 350000,
    discount_price: null,
    description: '',
    images: [],
    shadesInput: '',
    soldOutShades: [],
    sizesInput: 'All Size',
    bust: '100 cm',
    length: '70 cm',
    fabric: 'Silk / Linen',
    custom_badge: '',
    status: 'Ready Stock',
    is_featured: false,
    marketplace_url: '',
  });
  const [soldOutVariants, setSoldOutVariants] = useState<string[]>([]);
  const [sizeVariants, setSizeVariants] = useState<Record<string, { bust: string; length: string }>>({});
  const parsedSizes = productForm.sizesInput.split(',').map((s) => s.trim()).filter(Boolean);
  const parsedShades = productForm.shadesInput.split(',').map((shade) => shade.trim()).filter(Boolean);

  const toggleSoldOutVariant = (shade: string, size: string) => {
    const variant = `${shade}::${size}`;
    const isVariantMarkedSoldOut = soldOutVariants.includes(variant);
    const shadeIsMarkedSoldOut = productForm.soldOutShades.includes(shade);
    const nextVariants = shadeIsMarkedSoldOut && !isVariantMarkedSoldOut
      ? [
          ...soldOutVariants.filter((item) => !item.startsWith(`${shade}::`)),
          ...parsedSizes.filter((item) => item !== size).map((item) => `${shade}::${item}`),
        ]
      : isVariantMarkedSoldOut
        ? soldOutVariants.filter((item) => item !== variant)
        : [...soldOutVariants, variant];

    setSoldOutVariants(nextVariants);
    setProductForm((previous) => ({
      ...previous,
      soldOutShades: parsedSizes.length > 0 &&
        parsedSizes.every((item) => nextVariants.includes(`${shade}::${item}`))
        ? previous.soldOutShades.includes(shade)
          ? previous.soldOutShades
          : [...previous.soldOutShades, shade]
        : previous.soldOutShades.filter((item) => item !== shade),
    }));
  };

  const toggleSoldOutShade = (shade: string) => {
    const isShadeSoldOut = productForm.soldOutShades.includes(shade);
    if (
      isShadeSoldOut &&
      parsedSizes.length > 0 &&
      parsedSizes.every((size) => soldOutVariants.includes(`${shade}::${size}`))
    ) {
      setSoldOutVariants((previous) =>
        previous.filter((variant) => !variant.startsWith(`${shade}::`))
      );
    }

    setProductForm((previous) => ({
      ...previous,
      soldOutShades: isShadeSoldOut
        ? previous.soldOutShades.filter((item) => item !== shade)
        : [...previous.soldOutShades, shade],
    }));
  };

  const updateSizeVariant = (size: string, field: 'bust' | 'length', value: string) => {
    setSizeVariants((previous) => ({
      ...previous,
      [size]: {
        bust: previous[size]?.bust ?? productForm.bust,
        length: previous[size]?.length ?? productForm.length,
        [field]: value,
      },
    }));
  };

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  // Settings Save State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchDatabaseData = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();

      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && prodData) {
        setProducts(prodData as Product[]);
      }

      const { data: setData, error: setErr } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!setErr && setData) {
        setSettings({
          ...(setData as StoreSettings),
          categories: Array.isArray(setData.categories) ? setData.categories : DEFAULT_CATEGORIES,
        });
      }
    } catch (err) {
      console.warn('Error fetching admin live data:', err);
    }
  };

  // 1. Check Authentication on Mount
  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured()) {
        const previewAllowed = localStorage.getItem('theichalle_admin_preview');
        if (!previewAllowed) {
          router.replace('/admin/login');
          return;
        }
        setIsDemoMode(true);
        setCurrentUserEmail('admin@theichalle.com');
        setIsInitializing(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/admin/login');
          return;
        }
        setCurrentUserEmail(user.email || 'Admin');
        await fetchDatabaseData();
      } catch (err) {
        console.error('Admin init error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [router]);

  // 2. Logout handler
  const handleLogout = async () => {
    localStorage.removeItem('theichalle_admin_preview');
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.replace('/admin/login');
  };

  // 3. Quick Status Toggle
  const handleQuickStatusChange = async (productId: string, newStatus: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
    );

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('products')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', productId);

        if (error) throw error;
        showToast(`Status updated to "${newStatus}"`);
      } catch (err: unknown) {
        showToast(getErrorMessage(err, 'Failed to update status'), 'error');
      }
    } else {
      showToast(`Status updated to "${newStatus}" (Local preview)`);
    }
  };

  // 4. Quick Featured Toggle
  const handleQuickFeaturedToggle = async (productId: string, currentFeatured: boolean) => {
    const nextVal = !currentFeatured;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_featured: nextVal } : p))
    );

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('products')
          .update({ is_featured: nextVal, updated_at: new Date().toISOString() })
          .eq('id', productId);

        if (error) throw error;
        showToast(nextVal ? 'Marked as Featured' : 'Unmarked from Featured');
      } catch (err: unknown) {
        showToast(getErrorMessage(err, 'Failed to toggle featured'), 'error');
      }
    } else {
      showToast(nextVal ? 'Marked as Featured (Preview)' : 'Unmarked (Preview)');
    }
  };

  // 5. Open Add / Edit Product Modal
  const openAddProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      category: settings.categories?.[0] ?? '',
      price: 350000,
      discount_price: null,
      description: '',
      images: [],
      shadesInput: 'Oatmeal, Burgundy',
      soldOutShades: [],
      sizesInput: 'All Size',
      bust: '100 cm',
      length: '70 cm',
      fabric: 'Premium Silk Linen',
      custom_badge: '',
      status: 'Ready Stock',
      is_featured: false,
      marketplace_url: '',
    });
    setSoldOutVariants([]);
    setSizeVariants({});
    setCompressionInfo(null);
    setCustomImageUrlInput('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    const hasTaggedImages = product.images?.some((image) => parseProductImage(image).shade !== null);
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      discount_price: product.discount_price ?? null,
      description: product.description || '',
      images: (product.images || []).map((image, index) => {
        const parsedImage = parseProductImage(image);
        return hasTaggedImages
          ? image
          : formatProductImage(parsedImage.url, product.shades?.[index] ?? null);
      }),
      shadesInput: product.shades?.join(', ') || '',
      soldOutShades: product.sold_out_shades || [],
      sizesInput: product.sizes?.join(', ') || '',
      bust: product.size_guide?.bust || '',
      length: product.size_guide?.length || '',
      fabric: product.size_guide?.fabric || '',
      custom_badge: product.custom_badge || '',
      status: product.status,
      is_featured: product.is_featured,
      marketplace_url: product.marketplace_url || '',
    });
    setSoldOutVariants(product.sold_out_variants || []);
    setSizeVariants(product.size_guide?.variants || {});
    setCompressionInfo(null);
    setCustomImageUrlInput('');
    setIsProductModalOpen(true);
  };

  // 6. Delete Product Handler
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (error) throw error;
        showToast(`Product "${product.name}" deleted.`);
      } catch (err: unknown) {
        showToast(getErrorMessage(err, 'Failed to delete product'), 'error');
      }
    } else {
      showToast(`Product "${product.name}" removed.`);
    }
  };

  // 7. Image Upload with Browser Compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setCompressionInfo(null);

    try {
      for (const file of Array.from(files)) {
        const { file: compressedFile, originalSizeKB, compressedSizeKB, reductionPercentage } =
          await compressProductImage(file);

        setCompressionInfo(
          `Optimized: ${originalSizeKB} KB ➔ ${compressedSizeKB} KB (-${reductionPercentage}%)`
        );

        let imageUrl: string;
        if (isSupabaseConfigured() && !isDemoMode) {
          const supabase = createClient();
          const fileExt = compressedFile.name.split('.').pop() || 'webp';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('catalog-images')
            .upload(filePath, compressedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('catalog-images')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        } else {
          imageUrl = URL.createObjectURL(compressedFile);
        }

        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
      }
      showToast(isDemoMode || !isSupabaseConfigured()
        ? 'Images compressed & added (Preview Mode)'
        : 'Images compressed & uploaded to storage!');
    } catch (err: unknown) {
      console.error('Image compression/upload error:', err);
      showToast(getErrorMessage(err, 'Image upload failed'), 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddDirectImageUrl = () => {
    if (!customImageUrlInput.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, customImageUrlInput.trim()],
    }));
    setCustomImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleImageShadeChange = (index: number, shade: string) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.map((image, imageIndex) => {
        if (imageIndex !== index) return image;
        const { url } = parseProductImage(image);
        return formatProductImage(url, shade || null);
      }),
    }));
  };

  // 8. Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      alert('Product name is required.');
      return;
    }

    const shadesArray = productForm.shadesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const sizesArray = parsedSizes;
    const variants = Object.fromEntries(
      parsedSizes.map((size) => [
        size,
        {
          bust: sizeVariants[size]?.bust ?? productForm.bust,
          length: sizeVariants[size]?.length ?? productForm.length,
        },
      ])
    );
    const firstSizeVariant = parsedSizes.length > 1 ? variants[parsedSizes[0]] : undefined;

    const productPayload: Omit<Product, 'id' | 'created_at'> = {
      name: productForm.name.trim(),
      slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: productForm.category,
      price: Number(productForm.price),
      discount_price: productForm.discount_price ? Number(productForm.discount_price) : null,
      description: productForm.description,
      images: productForm.images.length > 0
        ? productForm.images.map((image) => {
            const parsedImage = parseProductImage(image);
            const shade = parsedImage.shade && shadesArray.includes(parsedImage.shade)
              ? parsedImage.shade
              : null;
            return formatProductImage(parsedImage.url, shade);
          })
        : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800'],
      shades: shadesArray,
      sold_out_shades: productForm.soldOutShades.filter((shade) => shadesArray.includes(shade)),
      sizes: sizesArray,
      sold_out_variants: soldOutVariants.filter((variant) => {
        const [shade, size] = variant.split('::');
        return shadesArray.includes(shade) && sizesArray.includes(size);
      }),
      size_guide: {
        bust: firstSizeVariant?.bust ?? productForm.bust,
        length: firstSizeVariant?.length ?? productForm.length,
        fabric: productForm.fabric,
        variants,
      },
      status: productForm.status,
      is_featured: productForm.is_featured,
      marketplace_url: productForm.marketplace_url || null,
      custom_badge: productForm.custom_badge.trim() || null,
    };

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProductId ? { ...p, ...productPayload } : p))
      );

      if (isSupabaseConfigured() && !isDemoMode) {
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('products')
            .update({ ...productPayload, updated_at: new Date().toISOString() })
            .eq('id', editingProductId);

          if (error) throw error;
          showToast('Product updated successfully!');
        } catch (err: unknown) {
          showToast(getErrorMessage(err, 'Failed to update product'), 'error');
        }
      } else {
        showToast('Product updated (Preview mode)');
      }
    } else {
      const newId = createTemporaryProductId();
      const newProduct: Product = {
        ...productPayload,
        id: newId,
        created_at: new Date().toISOString(),
      };

      setProducts((prev) => [newProduct, ...prev]);

      if (isSupabaseConfigured() && !isDemoMode) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('products')
            .insert([{ ...productPayload }])
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setProducts((prev) => prev.map((p) => (p.id === newId ? (data as Product) : p)));
          }
          showToast('New product added to catalog!');
        } catch (err: unknown) {
          showToast(getErrorMessage(err, 'Failed to insert product'), 'error');
        }
      } else {
        showToast('New product added (Preview mode)');
      }
    }

    setIsProductModalOpen(false);
  };

  // 9. Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    if (isSupabaseConfigured() && !isDemoMode) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('store_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 1);

        if (error) throw error;
        showToast('Store settings saved successfully!');
      } catch (err: unknown) {
        showToast(getErrorMessage(err, 'Failed to save settings'), 'error');
      } finally {
        setIsSavingSettings(false);
      }
    } else {
      setTimeout(() => {
        setIsSavingSettings(false);
        showToast('Store settings updated (Preview Mode)');
      }, 400);
    }
  };

  const saveCategories = async (nextCategories: string[]) => {
    setIsSavingCategories(true);
    try {
      if (isSupabaseConfigured() && !isDemoMode) {
        const supabase = createClient();
        const { error } = await supabase
          .from('store_settings')
          .update({ categories: nextCategories, updated_at: new Date().toISOString() })
          .eq('id', 1);
        if (error) throw error;
      }

      setSettings((previous) => ({ ...previous, categories: nextCategories }));
      showToast(isDemoMode || !isSupabaseConfigured()
        ? 'Kategori diperbarui (Preview Mode)'
        : 'Kategori berhasil diperbarui');
      return true;
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Gagal menyimpan kategori'), 'error');
      return false;
    } finally {
      setIsSavingCategories(false);
    }
  };

  const handleAddCategory = async (category: string) => {
    const trimmedCategory = category.trim();
    const categories = settings.categories ?? DEFAULT_CATEGORIES;
    if (categories.some((existing) => existing.toLowerCase() === trimmedCategory.toLowerCase())) {
      showToast('Kategori tersebut sudah ada', 'error');
      return false;
    }
    return saveCategories([...categories, trimmedCategory]);
  };

  const handleRemoveCategory = async (category: string) => {
    const categories = settings.categories ?? DEFAULT_CATEGORIES;
    return saveCategories(
      categories.filter((existing) => existing.toLowerCase() !== category.toLowerCase())
    );
  };

  // 10. Hero Banner Upload with Compression
  const handleHeroBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const { file: compressedFile, originalSizeKB, compressedSizeKB, reductionPercentage } =
        await compressProductImage(files[0]);

      showToast(`Hero Image compressed: ${originalSizeKB}KB ➔ ${compressedSizeKB}KB (-${reductionPercentage}%)`);

      if (isSupabaseConfigured() && !isDemoMode) {
        const supabase = createClient();
        const fileExt = compressedFile.name.split('.').pop() || 'webp';
        const fileName = `hero-banner-${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('catalog-images')
          .upload(filePath, compressedFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('catalog-images')
          .getPublicUrl(filePath);

        setSettings((prev) => ({ ...prev, hero_image_url: publicUrl }));
      } else {
        const previewUrl = URL.createObjectURL(compressedFile);
        setSettings((prev) => ({ ...prev, hero_image_url: previewUrl }));
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Banner upload failed'), 'error');
    } finally {
      e.target.value = '';
    }
  };

  // 11. Promotional Pop-up Image Upload with Compression
  const handlePromoPopupUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const { file: compressedFile, originalSizeKB, compressedSizeKB, reductionPercentage } =
        await compressProductImage(files[0]);

      showToast(`Promo Poster compressed: ${originalSizeKB}KB ➔ ${compressedSizeKB}KB (-${reductionPercentage}%)`);

      if (isSupabaseConfigured() && !isDemoMode) {
        const supabase = createClient();
        const fileExt = compressedFile.name.split('.').pop() || 'webp';
        const fileName = `promo-popup-${Date.now()}.${fileExt}`;
        const filePath = `promos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('catalog-images')
          .upload(filePath, compressedFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('catalog-images')
          .getPublicUrl(filePath);

        setSettings((prev) => ({ ...prev, promo_popup_image_url: publicUrl }));
      } else {
        const previewUrl = URL.createObjectURL(compressedFile);
        setSettings((prev) => ({ ...prev, promo_popup_image_url: previewUrl }));
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Promo poster upload failed'), 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Filter products in admin
  const adminFilteredProducts = products.filter((p) => {
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (adminCategoryFilter !== 'All') {
      if (p.category.toLowerCase() !== adminCategoryFilter.toLowerCase()) return false;
    }
    return true;
  });

  // Stats calculation
  const totalCount = products.length;
  const readyStockCount = products.filter((p) => p.status === 'Ready Stock').length;
  const poCount = products.filter((p) => p.status === 'Pre-Order').length;
  const soldOutCount = products.filter((p) => p.status === 'Sold Out').length;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center text-[#5C1A26]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5C1A26] border-t-transparent rounded-full animate-spin" />
          <span className="font-serif text-lg tracking-widest uppercase">The Ichalle Admin</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2B2625] flex flex-col selection:bg-[#5C1A26] selection:text-[#FAF6F0] overflow-x-hidden">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 py-2.5 px-3.5 rounded shadow-xl flex items-center gap-2 text-xs font-medium animate-in slide-in-from-top-3 max-w-[90vw] ${
            toastMessage.type === 'success'
              ? 'bg-[#5C1A26] text-[#FAF6F0]'
              : 'bg-red-700 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-[#FAF6F0]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          )}
          <span className="truncate">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="bg-[#FAF6F0] border-b border-[#EADFCF] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="font-serif text-lg sm:text-2xl uppercase tracking-[0.16em] text-[#5C1A26] font-normal">
              The Ichalle
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest bg-[#5C1A26] text-[#FAF6F0] px-1.5 py-0.5 rounded-sm font-medium">
              Admin
            </span>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-[#2B2625]/80 hover:text-[#5C1A26] px-2.5 py-1.5 rounded border border-[#EADFCF] hover:bg-[#F3ECE1] transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
              <ExternalLink className="w-3 h-3 text-[#2B2625]/40" />
            </a>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 text-[#2B2625]/70 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Horizontal Scrollable on Mobile) */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex space-x-4 sm:space-x-6 border-t border-[#EADFCF]/50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2.5 sm:py-3 text-[11px] sm:text-xs uppercase tracking-wider font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'products'
                ? 'border-[#5C1A26] text-[#5C1A26]'
                : 'border-transparent text-[#2B2625]/60 hover:text-[#2B2625]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 sm:py-3 text-[11px] sm:text-xs uppercase tracking-wider font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#5C1A26] text-[#5C1A26]'
                : 'border-transparent text-[#2B2625]/60 hover:text-[#2B2625]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Store Settings</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 flex-grow w-full">
        {/* ========================================================================= */}
        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-[#FAF6F0] p-3 sm:p-4 rounded-sm border border-[#EADFCF] shadow-xs">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#2B2625]/60 font-medium">Total</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#5C1A26] mt-0.5">{totalCount}</p>
              </div>
              <div className="bg-[#FAF6F0] p-3 sm:p-4 rounded-sm border border-[#EADFCF] shadow-xs">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#2B2625]/60 font-medium">Ready Stock</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 mt-0.5">{readyStockCount}</p>
              </div>
              <div className="bg-[#FAF6F0] p-3 sm:p-4 rounded-sm border border-[#EADFCF] shadow-xs">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#2B2625]/60 font-medium">Pre-Order</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-800 mt-0.5">{poCount}</p>
              </div>
              <div className="bg-[#FAF6F0] p-3 sm:p-4 rounded-sm border border-[#EADFCF] shadow-xs">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#2B2625]/60 font-medium">Sold Out</span>
                <p className="font-serif text-xl sm:text-2xl font-bold text-gray-500 mt-0.5">{soldOutCount}</p>
              </div>
            </div>

            <ManageCategoriesPanel
              categories={settings.categories ?? DEFAULT_CATEGORIES}
              isSaving={isSavingCategories}
              onAdd={handleAddCategory}
              onRemove={handleRemoveCategory}
            />

            {/* Action Bar: Search, Category Filter, and Add Product Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#FAF6F0] p-3 sm:p-4 rounded-sm border border-[#EADFCF]">
              <div className="flex items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2625]/45" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search catalog..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                  {adminSearch && (
                    <button
                      onClick={() => setAdminSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#2B2625]/40"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                  className="bg-[#FAF6F0] border border-[#EADFCF] rounded px-2.5 py-1.5 text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26] shrink-0"
                >
                  <option value="All">All</option>
                  {(settings.categories ?? DEFAULT_CATEGORIES).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Add Product Button */}
              <button
                onClick={openAddProductModal}
                className="bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-4 py-2 rounded text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Piece</span>
              </button>
            </div>

            {/* MOBILE CARD LIST (< 768px): Thumb-friendly Product Cards */}
            <div className="block md:hidden space-y-3">
              {adminFilteredProducts.length > 0 ? (
                adminFilteredProducts.map((p) => {
                  const hasDiscount = typeof p.discount_price === 'number' && p.discount_price < p.price;
                  const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300';

                  return (
                    <div
                      key={p.id}
                      className="bg-[#FAF6F0] rounded border border-[#EADFCF] p-3 shadow-2xs space-y-3"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-22 bg-[#F3ECE1] rounded shrink-0 overflow-hidden border border-[#EADFCF]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={p.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-[#5C1A26] font-semibold truncate">
                              {p.category}
                            </span>
                            {/* Featured Star Toggle */}
                            <button
                              onClick={() => handleQuickFeaturedToggle(p.id, p.is_featured)}
                              className={`p-1 rounded transition-colors ${
                                p.is_featured ? 'text-amber-500' : 'text-[#2B2625]/25'
                              }`}
                              title="Toggle featured"
                            >
                              <Star className={`w-4 h-4 ${p.is_featured ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          <h4 className="font-serif text-sm text-[#2B2625] font-medium leading-snug line-clamp-1 mt-0.5">
                            {p.name}
                          </h4>

                          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                            {hasDiscount ? (
                              <>
                                <span className="font-semibold text-xs text-[#5C1A26]">
                                  {formatRupiah(p.discount_price)}
                                </span>
                                <span className="text-[10px] text-[#2B2625]/45 line-through">
                                  {formatRupiah(p.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium text-xs text-[#2B2625]">
                                {formatRupiah(p.price)}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 text-[10px] text-[#2B2625]/60 truncate">
                            {p.shades?.length || 0} shades • {p.images?.length || 0} photos
                          </div>
                        </div>
                      </div>

                      {/* Mobile Bottom Quick Status & Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EADFCF]/60">
                        {/* Quick Status Dropdown */}
                        <select
                          value={p.status}
                          onChange={(e) => handleQuickStatusChange(p.id, e.target.value as ProductStatus)}
                          className={`text-xs font-medium py-1.5 px-2.5 rounded border focus:outline-none flex-1 ${
                            p.status === 'Ready Stock'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : p.status === 'Pre-Order'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : p.status === 'New Arrival'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="Ready Stock">Ready Stock</option>
                          <option value="Pre-Order">Pre-Order</option>
                          <option value="New Arrival">New Arrival</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="px-3 py-1.5 rounded border border-[#EADFCF] text-xs text-[#2B2625] hover:bg-[#F3ECE1] flex items-center gap-1 active:scale-95"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 active:scale-95"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 px-4 text-center bg-[#F3ECE1]/30 rounded border border-dashed border-[#EADFCF] flex flex-col items-center justify-center">
                  <Package className="w-8 h-8 text-[#5C1A26]/40 mb-2" />
                  <p className="text-xs text-[#2B2625]/70 font-medium max-w-sm">
                    {products.length === 0
                      ? 'No products yet. Click + ADD PIECE to add your first item.'
                      : 'No pieces found matching criteria.'}
                  </p>
                  {products.length === 0 && (
                    <button
                      onClick={openAddProductModal}
                      className="mt-3 bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-4 py-2 rounded text-xs uppercase tracking-widest font-medium flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ ADD PIECE</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP TABLE VIEW (>= 768px) */}
            <div className="hidden md:block bg-[#FAF6F0] rounded-sm border border-[#EADFCF] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F3ECE1] border-b border-[#EADFCF] text-[#2B2625] uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Shades & Sizes</th>
                      <th className="py-3 px-4">Quick Status</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFCF]/60">
                    {adminFilteredProducts.length > 0 ? (
                      adminFilteredProducts.map((p) => {
                        const hasDiscount = typeof p.discount_price === 'number' && p.discount_price < p.price;
                        const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300';

                        return (
                          <tr key={p.id} className="hover:bg-[#F3ECE1]/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-16 bg-[#F3ECE1] rounded-xs overflow-hidden shrink-0 border border-[#EADFCF]">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={thumb}
                                    alt={p.name}
                                    className="w-full h-full object-cover object-top"
                                  />
                                </div>
                                <div>
                                  <span className="font-serif text-sm font-medium text-[#2B2625] block line-clamp-1">
                                    {p.name}
                                  </span>
                                  <span className="text-[10px] text-[#2B2625]/50">
                                    {p.images?.length || 0} photo{p.images?.length === 1 ? '' : 's'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-[#2B2625]/80 font-medium">
                              {p.category}
                            </td>

                            <td className="py-3 px-4">
                              {hasDiscount ? (
                                <div>
                                  <span className="font-semibold text-[#5C1A26] block">
                                    {formatRupiah(p.discount_price)}
                                  </span>
                                  <span className="text-[10px] text-[#2B2625]/45 line-through">
                                    {formatRupiah(p.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-medium text-[#2B2625]">
                                  {formatRupiah(p.price)}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                {p.shades && p.shades.length > 0 && (
                                  <div className="text-[10px] text-[#2B2625]/70 line-clamp-1">
                                    <strong>Shades:</strong> {p.shades.join(', ')}
                                  </div>
                                )}
                                {p.sizes && p.sizes.length > 0 && (
                                  <div className="text-[10px] text-[#2B2625]/70 line-clamp-1">
                                    <strong>Sizes:</strong> {p.sizes.join(', ')}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={p.status}
                                onChange={(e) => handleQuickStatusChange(p.id, e.target.value as ProductStatus)}
                                className={`text-[11px] font-medium py-1 px-2 rounded border focus:outline-none cursor-pointer ${
                                  p.status === 'Ready Stock'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : p.status === 'Pre-Order'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : p.status === 'New Arrival'
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}
                              >
                                <option value="Ready Stock">Ready Stock</option>
                                <option value="Pre-Order">Pre-Order</option>
                                <option value="New Arrival">New Arrival</option>
                                <option value="Sold Out">Sold Out</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleQuickFeaturedToggle(p.id, p.is_featured)}
                                className={`p-1.5 rounded-full transition-colors ${
                                  p.is_featured
                                    ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                                    : 'text-[#2B2625]/30 hover:text-amber-500'
                                }`}
                                title="Toggle Featured"
                              >
                                <Star className={`w-4 h-4 ${p.is_featured ? 'fill-current' : ''}`} />
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="p-1.5 text-[#2B2625]/70 hover:text-[#5C1A26] rounded hover:bg-[#F3ECE1]"
                                  title="Edit Piece"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-[#2B2625]/70 hover:text-red-700 rounded hover:bg-red-50"
                                  title="Delete Piece"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-14 px-4 text-[#2B2625]/70 text-xs">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Package className="w-8 h-8 text-[#5C1A26]/40 mb-1" />
                            <p className="font-medium max-w-sm">
                              {products.length === 0
                                ? 'No products yet. Click + ADD PIECE to add your first item.'
                                : 'No pieces found matching criteria.'}
                            </p>
                            {products.length === 0 && (
                              <button
                                onClick={openAddProductModal}
                                className="mt-2 bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-4 py-2 rounded text-xs uppercase tracking-widest font-medium flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ ADD PIECE</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STORE SETTINGS & POLICIES */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl overflow-x-hidden">
            {/* 1. Announcement Bar Settings */}
            <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-sm border border-[#EADFCF] shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-[#EADFCF] pb-2.5">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-normal text-[#2B2625]">
                    Top Announcement Bar
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#2B2625]/60">
                    Appears across the very top of the storefront
                  </p>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={settings.announcement_enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, announcement_enabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#5C1A26]"
                  />
                  <span>Show</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Banner Text
                </label>
                <input
                  type="text"
                  value={settings.announcement_text}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, announcement_text: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>
            </div>

            {/* 2. Promotional Pop-up Banner (Welcome Modal - Al-Fath Style) */}
            <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-sm border border-[#EADFCF] shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-[#EADFCF] pb-2.5">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-normal text-[#2B2625] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C2654A]" />
                    <span>Promotional Pop-up Banner (Welcome Modal)</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#2B2625]/60">
                    Appears automatically once per session when visitors open the catalog (Al-Fath style)
                  </p>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.promo_popup_active)}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, promo_popup_active: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#5C1A26]"
                  />
                  <span>Enable Pop-up</span>
                </label>
              </div>

              {/* Poster Image URL & Upload */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Promo Poster Image URL or Upload
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={settings.promo_popup_image_url || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, promo_popup_image_url: e.target.value }))
                    }
                    placeholder="https://... (Recommended 4:5 portrait ratio, e.g. 800x1000px)"
                    className="flex-1 px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />

                  <label className="cursor-pointer bg-[#F3ECE1] hover:bg-[#EADFCF] text-[#5C1A26] px-3.5 py-2 rounded border border-[#EADFCF] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Poster</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePromoPopupUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[10px] text-[#2B2625]/50 mt-1">
                  Recommendation: 4:5 portrait image or 1:1 square for optimal smartphone fit.
                </p>

                {/* Poster Preview with Remove Button */}
                {settings.promo_popup_image_url && (
                  <div className="relative mt-3 w-32 sm:w-36 aspect-[4/5] rounded-lg overflow-hidden border border-[#EADFCF] shadow-xs group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.promo_popup_image_url}
                      alt="Promo preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, promo_popup_image_url: null }))}
                      className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow transition-opacity"
                      title="Remove promo image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Redirect Link Input */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Redirect Link when Poster Clicked (Optional)
                </label>
                <input
                  type="text"
                  value={settings.promo_popup_link || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, promo_popup_link: e.target.value }))
                  }
                  placeholder="e.g. #catalog (scroll to collection) or WhatsApp link https://wa.me/..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
                <span className="text-[10px] text-[#2B2625]/50 mt-1 block">
                  Leave empty or use #catalog to smoothly scroll to products when clicked.
                </span>
              </div>
            </div>

            {/* 3. Hero Section Settings */}
            <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-sm border border-[#EADFCF] shadow-xs space-y-3 sm:space-y-4">
              <div className="border-b border-[#EADFCF] pb-2.5">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#2B2625]">
                  Hero Banner Section
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#2B2625]/60">
                  Small eyebrow tag, headline, subtitle, and primary editorial image
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Hero Small Tag / Label (Optional)
                </label>
                <input
                  type="text"
                  value={settings.hero_eyebrow ?? ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, hero_eyebrow: e.target.value }))}
                  placeholder="e.g. EDITORIAL EDITION or NEW ARRIVAL (leave blank to hide)"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={settings.hero_title}
                    onChange={(e) => setSettings((prev) => ({ ...prev, hero_title: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.hero_subtitle}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, hero_subtitle: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>
              </div>

              {/* Hero Image Upload */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Hero Image URL or Upload
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={settings.hero_image_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, hero_image_url: e.target.value }))
                    }
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />

                  <label className="cursor-pointer bg-[#F3ECE1] hover:bg-[#EADFCF] text-[#5C1A26] px-3.5 py-2 rounded border border-[#EADFCF] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroBannerUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {settings.hero_image_url && (
                  <div className="relative mt-2.5 h-28 sm:h-36 w-full max-w-sm rounded overflow-hidden border border-[#EADFCF]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.hero_image_url}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Contact & Social Channels */}
            <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-sm border border-[#EADFCF] shadow-xs space-y-3 sm:space-y-4">
              <div className="border-b border-[#EADFCF] pb-2.5">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#2B2625]">
                  Concierge & Social Links
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    WhatsApp Order Number
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, whatsapp_number: e.target.value }))
                    }
                    placeholder="6281234567890"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="text"
                    value={settings.instagram_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, instagram_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Shopee Official Shop URL
                  </label>
                  <input
                    type="text"
                    value={settings.shopee_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, shopee_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    TikTok Official URL
                  </label>
                  <input
                    type="text"
                    value={settings.tiktok_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, tiktok_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Google Maps Boutique Link
                  </label>
                  <input
                    type="text"
                    value={settings.gmaps_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, gmaps_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    E-Catalogue PDF Link
                  </label>
                  <input
                    type="text"
                    value={settings.ecatalogue_url}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, ecatalogue_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>
              </div>
            </div>

            {/* 5. Policy & Editorial Texts */}
            <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-sm border border-[#EADFCF] shadow-xs space-y-3 sm:space-y-4">
              <div className="border-b border-[#EADFCF] pb-2.5">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#2B2625]">
                  Brand Information & Policies
                </h3>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  About Us Story
                </label>
                <textarea
                  rows={3}
                  value={settings.about_us}
                  onChange={(e) => setSettings((prev) => ({ ...prev, about_us: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={3}
                  value={settings.terms_conditions}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, terms_conditions: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Privacy Policy
                </label>
                <textarea
                  rows={3}
                  value={settings.privacy_policy}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, privacy_policy: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Refund & Exchange Policy
                </label>
                <textarea
                  rows={3}
                  value={settings.refund_policy}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, refund_policy: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full sm:w-auto bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-8 py-3 rounded text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (Mobile-Optimized) */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2625]/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="bg-[#FAF6F0] rounded-t-2xl sm:rounded-sm max-w-3xl w-full p-4 sm:p-7 shadow-2xl border border-[#EADFCF] max-h-[92vh] overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EADFCF] pb-3 mb-4">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#5C1A26] font-semibold">
                  Catalog Inventory
                </span>
                <h3 className="font-serif text-lg sm:text-2xl text-[#2B2625] font-normal">
                  {editingProductId ? 'Edit Product Piece' : 'Add New Product Piece'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-[#2B2625]/60 hover:text-[#5C1A26] rounded-full hover:bg-[#F3ECE1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 sm:space-y-5">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Aurelia Pleated Silk Blouse"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625]">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryManagerOpen(true)}
                      className="text-[10px] text-[#5C1A26] underline underline-offset-2 whitespace-nowrap"
                    >
                      + Manage / Add Category
                    </button>
                  </div>
                  <select
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  >
                    <option value="">Select a category</option>
                    {Array.from(new Set([
                      ...(settings.categories ?? DEFAULT_CATEGORIES),
                      ...(productForm.category &&
                      !(settings.categories ?? DEFAULT_CATEGORIES).some(
                        (category) => category.toLowerCase() === productForm.category.toLowerCase()
                      ) ? [productForm.category] : []),
                    ])).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Custom Badge Label (Optional)
                </label>
                <input
                  type="text"
                  value={productForm.custom_badge}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, custom_badge: e.target.value }))}
                  placeholder="Best Seller, Limited Edition, Raya Series"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>

              {/* Row 2: Price & Discount Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Standard Price (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    placeholder="389000"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Discount Price (Optional IDR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={productForm.discount_price ?? ''}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        discount_price: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="Leave blank if not on sale"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>
              </div>

              {/* Multi-Image Upload */}
              <div className="p-3.5 bg-[#F3ECE1]/50 border border-[#EADFCF] rounded-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#2B2625]">
                      Product Photos ({productForm.images.length})
                    </span>
                    <p className="text-[10px] text-[#2B2625]/60">
                      Auto-compressed. Choose a shade for each photo, or leave it as a cover/general photo.
                    </p>
                  </div>

                  <label className="cursor-pointer bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-3 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'Compressing...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {compressionInfo && (
                  <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {compressionInfo}
                  </div>
                )}

                {/* Direct URL input option */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customImageUrlInput}
                    onChange={(e) => setCustomImageUrlInput(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDirectImageUrl}
                    className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#F3ECE1] border border-[#EADFCF] rounded text-xs font-medium text-[#2B2625] shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                {/* Photos Thumbnail List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                  {productForm.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="min-w-0 space-y-1.5"
                    >
                      <div className="relative aspect-[3/4] bg-[#F3ECE1] rounded border border-[#EADFCF] overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={parseProductImage(img).url}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute top-1 left-1 bg-[#2B2625]/80 text-[#FAF6F0] text-[8px] px-1 py-0.2 rounded">
                          #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <select
                        value={parseProductImage(img).shade ?? ''}
                        onChange={(event) => handleImageShadeChange(idx, event.target.value)}
                        aria-label={`Shade for photo ${idx + 1}`}
                        className="w-full min-w-0 rounded border border-[#EADFCF] bg-[#FAF6F0] px-1.5 py-1 text-[10px] text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                      >
                        <option value="">Cover / General (No Shade)</option>
                        {parsedShades.map((shade, shadeIndex) => (
                          <option key={`${shade}-${shadeIndex}`} value={shade}>{shade}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {productForm.images.length === 0 && (
                    <div className="col-span-full py-5 text-center border border-dashed border-[#EADFCF] rounded text-xs text-[#2B2625]/45">
                      No photos attached.
                    </div>
                  )}

                  {isCategoryManagerOpen && (
                    <div className="fixed inset-0 z-[60] bg-[#2B2625]/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
                        <div className="flex justify-end mb-2">
                          <button
                            type="button"
                            onClick={() => setIsCategoryManagerOpen(false)}
                            aria-label="Tutup pengelolaan kategori"
                            className="p-2 bg-[#FAF6F0] text-[#2B2625] rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <ManageCategoriesPanel
                          categories={settings.categories ?? DEFAULT_CATEGORIES}
                          isSaving={isSavingCategories}
                          onAdd={async (category) => {
                            const added = await handleAddCategory(category);
                            if (added) {
                              setProductForm((previous) => ({
                                ...previous,
                                category: category.trim(),
                              }));
                            }
                            return added;
                          }}
                          onRemove={async (category) => {
                            const nextCategories = (settings.categories ?? DEFAULT_CATEGORIES)
                              .filter((existing) => existing.toLowerCase() !== category.toLowerCase());
                            const removed = await handleRemoveCategory(category);
                            if (removed) {
                              setProductForm((previous) => (
                                previous.category.toLowerCase() === category.toLowerCase()
                                  ? { ...previous, category: nextCategories[0] ?? '' }
                                  : previous
                              ));
                            }
                            return removed;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Detail the silhouette and fabric..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                />
              </div>

              {/* Shades & Sizes Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Available Shades
                  </label>
                  <input
                    type="text"
                    value={productForm.shadesInput}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, shadesInput: e.target.value }))
                    }
                    placeholder="Oatmeal, Burgundy, Olive"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {parsedShades.map((shade, index) => {
                        const isSoldOut = productForm.soldOutShades.includes(shade);
                        return (
                          <button
                            key={`${shade}-${index}`}
                            type="button"
                            aria-pressed={isSoldOut}
                              onClick={() => toggleSoldOutShade(shade)}
                            className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                              isSoldOut
                                ? 'border-red-300 bg-red-50 text-red-700 line-through'
                                : 'border-[#EADFCF] text-[#2B2625] hover:border-[#5C1A26]'
                            }`}
                          >
                            {shade}{isSoldOut ? ' (Habis)' : ''}
                          </button>
                        );
                      })}
                  </div>
                  <p className="text-[10px] text-[#5C1A26]/80 mt-1">
                    Klik warna untuk menandai atau membatalkan status habis.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Available Sizes
                  </label>
                  <input
                    type="text"
                    value={productForm.sizesInput}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, sizesInput: e.target.value }))
                    }
                    placeholder="S/M, L/XL or All Size"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625] focus:outline-none focus:border-[#5C1A26]"
                  />
                </div>
              </div>
              {parsedShades.length > 0 && parsedSizes.length > 0 && (
                <div className="space-y-2 rounded border border-[#EADFCF] p-3">
                  <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625]">
                    Shade + Size Stock
                  </span>
                  {parsedShades.map((shade) => {
                    const isShadeSoldOut = productForm.soldOutShades.includes(shade);
                    return (
                      <div key={shade} className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          aria-pressed={isShadeSoldOut}
                          onClick={() => toggleSoldOutShade(shade)}
                          className={`min-w-20 rounded border px-2 py-1 text-left text-[10px] transition-colors ${
                            isShadeSoldOut
                              ? 'border-red-300 bg-red-50 text-red-700 line-through'
                              : 'border-[#EADFCF] text-[#2B2625] hover:border-[#5C1A26]'
                          }`}
                        >
                          {shade}{isShadeSoldOut ? ' (Habis)' : ''}
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedSizes.map((size) => {
                            const isSoldOut = isShadeSoldOut ||
                              soldOutVariants.includes(`${shade}::${size}`);
                            return (
                              <button
                                key={`${shade}::${size}`}
                                type="button"
                                aria-pressed={isSoldOut}
                                onClick={() => toggleSoldOutVariant(shade, size)}
                                className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                                  isSoldOut
                                    ? 'border-red-300 bg-red-50 text-red-700 line-through'
                                    : 'border-[#EADFCF] text-[#2B2625] hover:border-[#5C1A26]'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Size Guide & Fabric Specs */}
              <div className="p-3 bg-[#F3ECE1]/30 border border-[#EADFCF] rounded space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5C1A26] block">
                  Garment Size Guide & Fabric
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {parsedSizes.length > 1 ? (
                    <div className="space-y-2 sm:col-span-3">
                      {parsedSizes.map((size) => {
                        const variant = sizeVariants[size] ?? {
                          bust: productForm.bust,
                          length: productForm.length,
                        };

                        return (
                          <div key={size} className="rounded border border-[#EADFCF] p-2">
                            <span className="mb-1.5 block text-[10px] font-semibold text-[#5C1A26]">
                              Size: {size}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-[#2B2625]/70 mb-0.5">
                                  Bust / LD
                                </label>
                                <input
                                  type="text"
                                  value={variant.bust}
                                  onChange={(e) => updateSizeVariant(size, 'bust', e.target.value)}
                                  placeholder="98-104 cm"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#2B2625]/70 mb-0.5">
                                  Length / PB
                                </label>
                                <input
                                  type="text"
                                  value={variant.length}
                                  onChange={(e) => updateSizeVariant(size, 'length', e.target.value)}
                                  placeholder="120 cm"
                                  className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] text-[#2B2625]/70 mb-0.5">
                          Bust / LD
                        </label>
                        <input
                          type="text"
                          value={productForm.bust}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, bust: e.target.value }))}
                          placeholder="98-104 cm"
                          className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#2B2625]/70 mb-0.5">
                          Length / PB
                        </label>
                        <input
                          type="text"
                          value={productForm.length}
                          onChange={(e) =>
                            setProductForm((prev) => ({ ...prev, length: e.target.value }))
                          }
                          placeholder="120 cm"
                          className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs"
                        />
                      </div>
                    </>
                  )}
                  <div className={parsedSizes.length > 1 ? 'sm:col-span-3' : ''}>
                    <label className="block text-[10px] text-[#2B2625]/70 mb-0.5">
                      Fabric
                    </label>
                    <input
                      type="text"
                      value={productForm.fabric}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, fabric: e.target.value }))
                      }
                      placeholder="Silk Crepe"
                      className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Status, Featured & Marketplace Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Status
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        status: e.target.value as ProductStatus,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625]"
                  >
                    <option value="Ready Stock">Ready Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2B2625] mb-1">
                    Marketplace Link
                  </label>
                  <input
                    type="text"
                    value={productForm.marketplace_url}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, marketplace_url: e.target.value }))
                    }
                    placeholder="https://shopee.co.id/..."
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFCF] rounded text-xs text-[#2B2625]"
                  />
                </div>

                <div className="pt-1 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wider text-[#2B2625]">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#5C1A26]"
                    />
                    <span>Featured Piece</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EADFCF]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded border border-[#EADFCF] text-xs uppercase tracking-wider text-[#2B2625]/80 hover:bg-[#F3ECE1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-5 py-2.5 rounded text-xs uppercase tracking-wider font-medium shadow-md transition-all active:scale-[0.98]"
                >
                  {editingProductId ? 'Save Changes' : 'Create Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}