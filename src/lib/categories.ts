export const DEFAULT_CATEGORIES = ['Blouses', 'Dresses', 'Sets', 'Outerwear', 'Skirts'];

export function getStorefrontCategories(categories?: string[] | null): string[] {
  const activeCategories = categories ?? DEFAULT_CATEGORIES;
  const list = ['All'];

  activeCategories.forEach((category) => {
    const normalized = category.trim().toLowerCase();
    if (
      normalized &&
      normalized !== 'all' &&
      normalized !== 'new arrivals' &&
      normalized !== 'sale' &&
      !list.some((item) => item.toLowerCase() === normalized)
    ) {
      list.push(category.trim());
    }
  });

  list.push('New Arrivals', 'Sale');
  return list;
}
