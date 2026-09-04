import { api } from '@/lib/api';
import type {
  Completeness,
  OpeningHour,
  StorefrontAbout,
  StorefrontBranding,
  StorefrontCMSConfig,
  StorefrontContact,
  StorefrontFaq,
  StorefrontFeatured,
  StorefrontFeature,
  StorefrontHero,
  StorefrontNavItem,
  StorefrontRecord,
  StorefrontSection,
  StorefrontSeo,
  StorefrontSocial,
  StorefrontStatus,
  StorefrontTestimonial,
} from '@/types';

const unwrap = <T>(res: { data: { data: T } }) => res.data.data;

export const storefrontService = {
  async getConfig(): Promise<StorefrontCMSConfig> {
    const res = await api.get('/storefront');
    return unwrap(res);
  },

  async getCompleteness(): Promise<Completeness> {
    const res = await api.get('/storefront/completeness');
    return unwrap(res);
  },

  async updateInfo(input: {
    storeName?: string | null;
    tagline?: string | null;
    copyright?: string | null;
    customerCount?: number;
    yearEstablished?: number | null;
    heroImageUrl?: string | null;
    heroImagePublicId?: string | null;
    logoUrl?: string | null;
    logoPublicId?: string | null;
    faviconPublicId?: string | null;
    onboardingStep?: number;
  }): Promise<StorefrontRecord> {
    const res = await api.patch('/storefront', input);
    return res.data.data.storefront;
  },

  async setStatus(status: StorefrontStatus): Promise<StorefrontRecord> {
    const res = await api.post('/storefront/publish', { status });
    return res.data.data.storefront;
  },

  // Hero
  async getHero(): Promise<StorefrontHero> {
    const res = await api.get('/storefront/hero');
    return res.data.data.hero;
  },
  async updateHero(input: Partial<StorefrontHero>): Promise<StorefrontHero> {
    const res = await api.patch('/storefront/hero', input);
    return res.data.data.hero;
  },

  // About
  async getAbout(): Promise<StorefrontAbout> {
    const res = await api.get('/storefront/about');
    return res.data.data.about;
  },
  async updateAbout(input: Partial<StorefrontAbout>): Promise<StorefrontAbout> {
    const res = await api.patch('/storefront/about', input);
    return res.data.data.about;
  },

  // Contact
  async getContact(): Promise<StorefrontContact> {
    const res = await api.get('/storefront/contact');
    return res.data.data.contact;
  },
  async updateContact(input: Partial<StorefrontContact>): Promise<StorefrontContact> {
    const res = await api.patch('/storefront/contact', input);
    return res.data.data.contact;
  },

  // Social
  async getSocial(): Promise<StorefrontSocial> {
    const res = await api.get('/storefront/social');
    return res.data.data.social;
  },
  async updateSocial(input: Partial<StorefrontSocial>): Promise<StorefrontSocial> {
    const res = await api.patch('/storefront/social', input);
    return res.data.data.social;
  },

  // Branding
  async getBranding(): Promise<StorefrontBranding> {
    const res = await api.get('/storefront/branding');
    return res.data.data.branding;
  },
  async updateBranding(input: Partial<StorefrontBranding>): Promise<StorefrontBranding> {
    const res = await api.patch('/storefront/branding', input);
    return res.data.data.branding;
  },

  // SEO
  async getSeo(): Promise<StorefrontSeo> {
    const res = await api.get('/storefront/seo');
    return res.data.data.seo;
  },
  async updateSeo(input: Partial<StorefrontSeo>): Promise<StorefrontSeo> {
    const res = await api.patch('/storefront/seo', input);
    return res.data.data.seo;
  },

  // Sections
  async getSections(): Promise<StorefrontSection[]> {
    const res = await api.get('/storefront/sections');
    return res.data.data.sections;
  },
  async updateSections(sections: { section: string; enabled: boolean; sortOrder: number }[]): Promise<StorefrontSection[]> {
    const res = await api.put('/storefront/sections', { sections });
    return res.data.data.sections;
  },

  // Featured products
  async getFeatured(): Promise<StorefrontFeatured[]> {
    const res = await api.get('/storefront/featured');
    return res.data.data.featured;
  },
  async addFeatured(productId: string): Promise<void> {
    await api.post('/storefront/featured', { productId });
  },
  async removeFeatured(id: string): Promise<void> {
    await api.delete(`/storefront/featured/${id}`);
  },
  async reorderFeatured(ids: string[]): Promise<void> {
    await api.put('/storefront/featured/reorder', { ids });
  },

  // Features (Why Choose Us)
  async getFeatures(): Promise<StorefrontFeature[]> {
    const res = await api.get('/storefront/features');
    return res.data.data.features;
  },
  async createFeature(input: { title: string; description: string; icon?: string }): Promise<StorefrontFeature> {
    const res = await api.post('/storefront/features', input);
    return res.data.data.feature;
  },
  async updateFeature(id: string, input: Partial<StorefrontFeature>): Promise<StorefrontFeature> {
    const res = await api.patch(`/storefront/features/${id}`, input);
    return res.data.data.feature;
  },
  async deleteFeature(id: string): Promise<void> {
    await api.delete(`/storefront/features/${id}`);
  },
  async reorderFeatures(ids: string[]): Promise<void> {
    await api.put('/storefront/features/reorder', { ids });
  },

  // Testimonials
  async getTestimonials(): Promise<StorefrontTestimonial[]> {
    const res = await api.get('/storefront/testimonials');
    return res.data.data.testimonials;
  },
  async createTestimonial(input: Partial<StorefrontTestimonial>): Promise<StorefrontTestimonial> {
    const res = await api.post('/storefront/testimonials', input);
    return res.data.data.testimonial;
  },
  async updateTestimonial(id: string, input: Partial<StorefrontTestimonial>): Promise<StorefrontTestimonial> {
    const res = await api.patch(`/storefront/testimonials/${id}`, input);
    return res.data.data.testimonial;
  },
  async deleteTestimonial(id: string): Promise<void> {
    await api.delete(`/storefront/testimonials/${id}`);
  },
  async reorderTestimonials(ids: string[]): Promise<void> {
    await api.put('/storefront/testimonials/reorder', { ids });
  },

  // FAQ
  async getFaqs(): Promise<StorefrontFaq[]> {
    const res = await api.get('/storefront/faqs');
    return res.data.data.faqs;
  },
  async createFaq(input: { question: string; answer: string }): Promise<StorefrontFaq> {
    const res = await api.post('/storefront/faqs', input);
    return res.data.data.faq;
  },
  async updateFaq(id: string, input: Partial<StorefrontFaq>): Promise<StorefrontFaq> {
    const res = await api.patch(`/storefront/faqs/${id}`, input);
    return res.data.data.faq;
  },
  async deleteFaq(id: string): Promise<void> {
    await api.delete(`/storefront/faqs/${id}`);
  },
  async reorderFaqs(ids: string[]): Promise<void> {
    await api.put('/storefront/faqs/reorder', { ids });
  },

  // Navigation
  async getNavigation(): Promise<StorefrontNavItem[]> {
    const res = await api.get('/storefront/navigation');
    return res.data.data.navigation;
  },
  async updateNavigation(items: { id?: string; label: string; href: string; enabled: boolean }[]): Promise<StorefrontNavItem[]> {
    const res = await api.put('/storefront/navigation', { items });
    return res.data.data.navigation;
  },
};

export function openingHoursMap(input: OpeningHour[] | null | undefined) {
  return input ?? [];
}
