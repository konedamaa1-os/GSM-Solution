/**
 * Helper to detect workshop slug or custom domain from current window location.
 */

export interface DomainInfo {
  isCustomDomain: boolean;
  isSubdomain: boolean;
  slugOrDomain: string | null;
  type: 'custom_domain' | 'subdomain' | 'param' | 'none';
}

const ROOT_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'vercel.app',
  'tontonboua.com',
  'gsmsolution.com',
  'gsmsolution.xyz'
];

export const getDomainInfo = (): DomainInfo => {
  if (typeof window === 'undefined') {
    return { isCustomDomain: false, isSubdomain: false, slugOrDomain: null, type: 'none' };
  }

  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const shopQuery = searchParams.get('shop');

  // 1. Query parameter check (e.g. localhost:5173?shop=atelier-paris)
  if (shopQuery && shopQuery.trim()) {
    return {
      isCustomDomain: false,
      isSubdomain: false,
      slugOrDomain: shopQuery.trim().toLowerCase(),
      type: 'param'
    };
  }

  // 2. Subdomain check on localhost (e.g., atelier1.localhost)
  if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '');
    if (sub && sub !== 'www' && sub !== 'app') {
      return {
        isCustomDomain: false,
        isSubdomain: true,
        slugOrDomain: sub,
        type: 'subdomain'
      };
    }
  }

  // 3. Subdomain check on vercel.app or root SaaS domain (e.g. atelier1.gsmsolution.com)
  for (const root of ROOT_DOMAINS) {
    if (hostname.endsWith(`.${root}`)) {
      const parts = hostname.split(`.${root}`)[0].split('.');
      const sub = parts[parts.length - 1];
      if (sub && sub !== 'www' && sub !== 'app') {
        return {
          isCustomDomain: false,
          isSubdomain: true,
          slugOrDomain: sub,
          type: 'subdomain'
        };
      }
    }
  }

  // 4. Custom domain check (e.g. mon-atelier-reparation.com)
  const isKnownRoot = ROOT_DOMAINS.some(root => hostname === root || hostname.endsWith(`.${root}`));
  if (!isKnownRoot && hostname !== 'localhost') {
    // Normalised custom domain
    const cleanHostname = hostname.startsWith('www.') ? hostname.replace('www.', '') : hostname;
    return {
      isCustomDomain: true,
      isSubdomain: false,
      slugOrDomain: cleanHostname,
      type: 'custom_domain'
    };
  }

  return { isCustomDomain: false, isSubdomain: false, slugOrDomain: null, type: 'none' };
};
