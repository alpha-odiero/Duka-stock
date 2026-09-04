// Centralized DukaStack design-token system for the customer storefront.
//
// This is the SINGLE source of truth for storefront colors. Components must
// never hardcode hex values or private fallbacks — they should reference the
// semantic CSS custom properties emitted by buildStorefrontTokens().
//
// Merchants can customize three brand colors (primary / secondary / accent)
// via the CMS. Everything else in the palette is derived so the storefront
// stays coherent and accessible no matter what brand colors are chosen.
//
// Semantic roles:
//   primary   = Deep Navy foundation (structure: header/footer/hero/dark surfaces)
//   secondary = Slate Navy secondary dark surface
//   accent    = Duka Orange action color (CTA, add-to-cart, checkout, links, active)
//
// Accessibility: every accent-colored surface resolves a readable foreground.

export const DUKASTACK_DEFAULTS = {
  primary: '#0F172A', // Deep Navy
  secondary: '#1E293B', // Slate Navy
  accent: '#F97316', // Duka Orange
} as const;

// Neutral + system tokens (theme-stable, shared by every shop).
export const NEUTRAL_TOKENS = {
  background: '#F8FAFC', // page bg
  surface: '#FFFFFF', // cards / panels
  warmBackground: '#FFF7ED', // soft warm section bg
  text: '#111827', // primary text (ink)
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0', // card / control borders
  borderSubtle: '#F1F5F9', // hairline / dividers
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',
} as const;

// CSS custom-property names (kebab-case) used across the storefront.
export const SF = {
  primary: '--sf-primary',
  primaryLight: '--sf-primary-light',
  secondary: '--sf-secondary',
  accent: '--sf-accent',
  accentHover: '--sf-accent-hover',
  accentSoft: '--sf-accent-soft',
  bg: '--sf-bg',
  surface: '--sf-surface',
  warm: '--sf-warm',
  text: '--sf-text',
  textSecondary: '--sf-text-secondary',
  muted: '--sf-muted',
  line: '--sf-line',
  lineSubtle: '--sf-line-subtle',
  success: '--sf-success',
  warning: '--sf-warning',
  error: '--sf-error',
  info: '--sf-info',
} as const;

function toHex(hex: string): string {
  return hex.replace('#', '');
}

// Convert a hex color to RGB channel numbers [r, g, b].
export function hexToRgb(hex: string): [number, number, number] | null {
  const h = toHex(hex);
  if (h.length === 3) {
    const [r, g, b] = h.split('').map((c) => parseInt(c + c, 16));
    return [r, g, b];
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

// Relative luminance in [0,1] for WCAG contrast decisions.
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Return the most readable foreground (near-black or white) for a background.
export function readableText(background: string): string {
  return luminance(background) > 0.42 ? '#111827' : '#FFFFFF';
}

// Soften an accent into a translucent highlight for badges/surfaces.
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// Darken a color by the given fraction for hover/focus states.
export function darken(hex: string, factor = 0.1): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map((v) => Math.round(v * (1 - factor)));
  const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

// Build the complete semantic CSS variable map from CMS branding colors,
// falling back to the DukaStack default theme when branding is absent.
export function buildStorefrontTokens(branding?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}): Record<string, string> {
  const primary = branding?.primaryColor || DUKASTACK_DEFAULTS.primary;
  const secondary = branding?.secondaryColor || DUKASTACK_DEFAULTS.secondary;
  const accent = branding?.accentColor || DUKASTACK_DEFAULTS.accent;

  return {
    [SF.primary]: primary,
    [SF.primaryLight]: secondary,
    [SF.secondary]: secondary,
    [SF.accent]: accent,
    [SF.accentHover]: darken(accent, 0.12),
    [SF.accentSoft]: withAlpha(accent, 0.14),
    [SF.bg]: NEUTRAL_TOKENS.background,
    [SF.surface]: NEUTRAL_TOKENS.surface,
    [SF.warm]: NEUTRAL_TOKENS.warmBackground,
    [SF.text]: NEUTRAL_TOKENS.text,
    [SF.textSecondary]: NEUTRAL_TOKENS.textSecondary,
    [SF.muted]: NEUTRAL_TOKENS.textMuted,
    [SF.line]: NEUTRAL_TOKENS.border,
    [SF.lineSubtle]: NEUTRAL_TOKENS.borderSubtle,
    [SF.success]: NEUTRAL_TOKENS.success,
    [SF.warning]: NEUTRAL_TOKENS.warning,
    [SF.error]: NEUTRAL_TOKENS.error,
    [SF.info]: NEUTRAL_TOKENS.info,
  };
}
