import { z } from 'zod';

const urlOrEmpty = z
  .string()
  .trim()
  .max(1000)
  .optional()
  .nullable()
  .or(z.literal(''));

// Main storefront record (store info + shared marketing fields editable by owner).
export const storefrontUpdateSchema = z.object({
  storeName: z.string().trim().min(1, 'Store name is required').max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  heroImageUrl: urlOrEmpty,
  heroImagePublicId: urlOrEmpty,
  logoUrl: urlOrEmpty,
  logoPublicId: urlOrEmpty,
  faviconPublicId: urlOrEmpty,
  copyright: z.string().trim().max(300).optional(),
  customerCount: z.coerce.number().int().min(0).optional(),
  yearEstablished: z.coerce.number().int().min(1800).max(2100).nullable().optional(),
});

export const storefrontStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const heroUpdateSchema = z.object({
  title: z.string().trim().max(200).optional(),
  subtitle: z.string().trim().max(300).optional(),
  description: z.string().trim().max(600).optional(),
  primaryText: z.string().trim().max(60).optional(),
  primaryLink: z.string().trim().max(300).optional(),
  secondaryText: z.string().trim().max(60).optional(),
  secondaryLink: z.string().trim().max(300).optional(),
  imageUrl: urlOrEmpty,
  imagePublicId: urlOrEmpty,
  backgroundEnabled: z.boolean().optional(),
  alignment: z.enum(['left', 'center']).optional(),
  show: z.boolean().optional(),
});

export const aboutUpdateSchema = z.object({
  title: z.string().trim().max(200).optional(),
  introduction: z.string().trim().max(600).optional(),
  story: z.string().trim().max(4000).optional(),
  mission: z.string().trim().max(1000).optional(),
  vision: z.string().trim().max(1000).optional(),
  values: z.string().trim().max(1000).optional(),
  imageUrl: urlOrEmpty,
  imagePublicId: urlOrEmpty,
  secondaryImageUrl: urlOrEmpty,
  secondaryImagePublicId: urlOrEmpty,
  showTeam: z.boolean().optional(),
});

const openingHourEntry = z.object({
  day: z.string().trim().min(1).max(30),
  open: z.string().trim().max(20),
  close: z.string().trim().max(20),
});

export const contactUpdateSchema = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(600).optional(),
  phone: urlOrEmpty,
  whatsappNumber: urlOrEmpty,
  whatsappMessage: z.string().trim().max(600).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  location: urlOrEmpty,
  address: urlOrEmpty,
  mapsUrl: urlOrEmpty,
  openingHours: z.array(openingHourEntry).max(30).optional(),
  showContactForm: z.boolean().optional(),
  showWhatsappBtn: z.boolean().optional(),
});

export const socialUpdateSchema = z.object({
  facebook: urlOrEmpty,
  instagram: urlOrEmpty,
  tiktok: urlOrEmpty,
  twitter: urlOrEmpty,
  youtube: urlOrEmpty,
  linkedin: urlOrEmpty,
});

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Enter a valid hex color');

export const brandingUpdateSchema = z.object({
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  buttonStyle: z.enum(['rounded', 'pill', 'square']).optional(),
  radius: z.enum(['subtle', 'smooth', 'large']).optional(),
  font: z.enum(['inter', 'poppins', 'system']).optional(),
});

export const seoUpdateSchema = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
  keywords: z.string().trim().max(500).optional(),
  ogImageUrl: urlOrEmpty,
  ogImagePublicId: urlOrEmpty,
  ogTitle: z.string().trim().max(200).optional(),
  ogDescription: z.string().trim().max(500).optional(),
});

export const sectionsUpdateSchema = z.object({
  sections: z
    .array(
      z.object({
        section: z.string().trim().min(1).max(40),
        enabled: z.boolean(),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const featuredAddSchema = z.object({
  productId: z.string().uuid('Invalid product'),
});

export const featuredReorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const featureCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  icon: z.string().trim().max(60).optional(),
});

export const featureUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(600).optional(),
  icon: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  enabled: z.boolean().optional(),
});

export const testimonialCreateSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).optional(),
  content: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  featured: z.boolean().optional(),
  imageUrl: urlOrEmpty,
  imagePublicId: urlOrEmpty,
});

export const testimonialUpdateSchema = z.object({
  customerName: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().max(120).optional().nullable().or(z.literal('')),
  content: z.string().trim().min(1).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  featured: z.boolean().optional(),
  enabled: z.boolean().optional(),
  imageUrl: urlOrEmpty,
  imagePublicId: urlOrEmpty,
});

export const faqCreateSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
});

export const faqUpdateSchema = z.object({
  question: z.string().trim().min(1).max(300).optional(),
  answer: z.string().trim().min(1).max(2000).optional(),
  enabled: z.boolean().optional(),
});

export const navUpdateSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid().optional(),
      label: z.string().trim().min(1).max(60),
      href: z.string().trim().min(1).max(300),
      enabled: z.boolean(),
    }),
  ),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});
