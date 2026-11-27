export interface ParsedProductImage {
  url: string;
  shade: string | null;
}

export function parseProductImage(rawUrl: string): ParsedProductImage {
  const hashIndex = rawUrl.indexOf('#');
  if (hashIndex === -1) return { url: rawUrl, shade: null };

  const url = rawUrl.slice(0, hashIndex);
  const fragments = rawUrl.slice(hashIndex + 1).split('&');
  const shadeFragment = fragments.find((fragment) => fragment.startsWith('shade='));
  if (!shadeFragment) return { url: rawUrl, shade: null };

  const shade = new URLSearchParams(shadeFragment).get('shade')?.trim() || null;
  const remainingFragment = fragments
    .filter((fragment) => fragment && !fragment.startsWith('shade='))
    .join('&');

  return {
    url: remainingFragment ? `${url}#${remainingFragment}` : url,
    shade,
  };
}

export function formatProductImage(url: string, shade: string | null): string {
  const parsed = parseProductImage(url);
  const cleanUrl = parsed.url;
  if (!shade?.trim()) return cleanUrl;

  const separator = cleanUrl.includes('#') ? '&' : '#';
  return `${cleanUrl}${separator}shade=${encodeURIComponent(shade.trim())}`;
}
