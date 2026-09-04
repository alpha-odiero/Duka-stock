import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store';
import type { PublicStorefrontConfig } from '@/types';
import { STOREFRONT_LAST_UPDATED_KEY } from '@/context/StorefrontCmsContext';
import { buildStorefrontTokens, DUKASTACK_DEFAULTS } from '@/storefront/theme';

interface StorefrontValue {
  config: PublicStorefrontConfig | undefined;
  shopName: string | undefined;
  href: (path: string) => string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  primary: string;
  secondary: string;
  accent: string;
  currency: string;
  buttonRadius: string;
  cardRadius: string;
  fontClass: string;
}

const StorefrontContext = createContext<StorefrontValue | null>(null);

function readShopParam(): string | undefined {
  const p = new URLSearchParams(window.location.search).get('shop');
  return p || undefined;
}

const BUTTON_RADIUS: Record<string, string> = {
  rounded: '0.5rem',
  pill: '9999px',
  square: '0.125rem',
};

const CARD_RADIUS: Record<string, string> = {
  subtle: '0.375rem',
  smooth: '0.75rem',
  large: '1.25rem',
};

const FONT_CLASS: Record<string, string> = {
  inter: 'font-sans',
  poppins: 'font-[Poppins]',
  system: 'font-sans',
};

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const shopName = readShopParam();

  const query = useQuery({
    queryKey: ['store', 'config', shopName] as const,
    queryFn: () => storeService.getConfig(shopName),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const { data: config } = query;

  // Authoritative shop scope: the `?shop=` param wins until the resolved
  // config arrives (GET /store/config returns the served shop's name).
  const resolvedShopName = config?.shopName ?? shopName;

  // Builds a storefront-internal path that keeps the `?shop=` scope on every
  // link so navigation can never leak into another tenant's storefront.
  const href = useCallback(
    (path: string): string => {
      if (!resolvedShopName) return path;
      const [base, query] = path.split('?');
      const params = new URLSearchParams(query ?? '');
      params.set('shop', resolvedShopName);
      const qs = params.toString();
      return qs ? `${base}?${qs}` : base;
    },
    [resolvedShopName],
  );

  const primary = config?.branding.primaryColor ?? DUKASTACK_DEFAULTS.primary;
  const secondary = config?.branding.secondaryColor ?? DUKASTACK_DEFAULTS.secondary;
  const accent = config?.branding.accentColor ?? DUKASTACK_DEFAULTS.accent;
  const currency = config?.currency ?? 'KES';
  const buttonRadius = config ? BUTTON_RADIUS[config.branding.buttonStyle] : '0.5rem';
  const cardRadius = config ? CARD_RADIUS[config.branding.radius] : '0.75rem';
  const fontClass = config ? FONT_CLASS[config.branding.font] : 'font-sans';

  useEffect(() => {
    if (!config) return;
    const root = document.documentElement;
    const tokens = buildStorefrontTokens(config.branding);
    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(name, value);
    }
    const title = config.seo?.title || `${config.storeName ?? 'Shop'} | ${config.tagline ?? ''}`.trim();
    document.title = title || 'Shop';
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', config.seo?.description ?? config.tagline ?? '');
  }, [config, primary, secondary, accent]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STOREFRONT_LAST_UPDATED_KEY && event.newValue) {
        void query.refetch();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [query]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  const value = useMemo<StorefrontValue>(
    () => ({
      config,
      shopName: resolvedShopName,
      href,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch,
      primary,
      secondary,
      accent,
      currency,
      buttonRadius,
      cardRadius,
      fontClass,
    }),
    [config, resolvedShopName, href, query.isLoading, query.isError, refetch, primary, secondary, accent, currency, buttonRadius, cardRadius, fontClass],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): StorefrontValue {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used within a StorefrontProvider');
  return ctx;
}

// Style helper for accent (action) buttons.
export function brandButton(color: string, radius: string, foreground?: string) {
  return {
    backgroundColor: color,
    color: foreground,
    borderRadius: radius,
  };
}
