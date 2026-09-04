import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import * as sfService from './storefront.service';
import {
  aboutUpdateSchema,
  brandingUpdateSchema,
  contactUpdateSchema,
  faqCreateSchema,
  faqUpdateSchema,
  featureCreateSchema,
  featureUpdateSchema,
  featuredAddSchema,
  featuredReorderSchema,
  heroUpdateSchema,
  idParamSchema,
  navUpdateSchema,
  reorderSchema,
  sectionsUpdateSchema,
  seoUpdateSchema,
  socialUpdateSchema,
  storefrontStatusSchema,
  storefrontUpdateSchema,
  testimonialCreateSchema,
  testimonialUpdateSchema,
} from './storefront.schema';

const router = Router();
router.use(requireAuth, requireShop);

// Writes to the storefront require elevated permissions (cashiers can view).
const write = authorize('OWNER', 'ADMIN');

// ===== Overview / main record =====

router.get('/', async (req, res, next) => {
  try {
    const config = await sfService.getStorefrontConfigForCms(req.user!.shop!.id);
    return ok(res, config);
  } catch (error) {
    next(error);
  }
});

router.patch('/', write, validate(storefrontUpdateSchema), async (req, res, next) => {
  try {
    const sf = await sfService.updateStorefront(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_UPDATED', entityType: 'Storefront', entityId: sf.id, req });
    return ok(res, { storefront: sf });
  } catch (error) {
    next(error);
  }
});

router.post('/publish', write, validate(storefrontStatusSchema), async (req, res, next) => {
  try {
    const status = (req.body as { status: 'DRAFT' | 'PUBLISHED' }).status;
    const sf = await sfService.setStorefrontStatus(req.user!.shop!.id, status);
    await auditLog({
      action: status === 'PUBLISHED' ? 'STOREFRONT_PUBLISHED' : 'STOREFRONT_UNPUBLISHED',
      entityType: 'Storefront',
      entityId: sf.id,
      req,
    });
    return ok(res, { storefront: sf });
  } catch (error) {
    next(error);
  }
});

router.get('/completeness', async (req, res, next) => {
  try {
    const completeness = await sfService.getCompleteness(req.user!.shop!.id);
    return ok(res, completeness);
  } catch (error) {
    next(error);
  }
});

// ===== Hero =====

router.get('/hero', async (req, res, next) => {
  try {
    const hero = await sfService.getHero(req.user!.shop!.id);
    return ok(res, { hero });
  } catch (error) {
    next(error);
  }
});

router.patch('/hero', write, validate(heroUpdateSchema), async (req, res, next) => {
  try {
    const hero = await sfService.updateHero(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_HERO_UPDATED', entityType: 'StorefrontHero', entityId: hero.id, req });
    return ok(res, { hero });
  } catch (error) {
    next(error);
  }
});

// ===== About =====

router.get('/about', async (req, res, next) => {
  try {
    const about = await sfService.getAbout(req.user!.shop!.id);
    return ok(res, { about });
  } catch (error) {
    next(error);
  }
});

router.patch('/about', write, validate(aboutUpdateSchema), async (req, res, next) => {
  try {
    const about = await sfService.updateAbout(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_ABOUT_UPDATED', entityType: 'StorefrontAbout', entityId: about.id, req });
    return ok(res, { about });
  } catch (error) {
    next(error);
  }
});

// ===== Contact =====

router.get('/contact', async (req, res, next) => {
  try {
    const contact = await sfService.getContact(req.user!.shop!.id);
    return ok(res, { contact });
  } catch (error) {
    next(error);
  }
});

router.patch('/contact', write, validate(contactUpdateSchema), async (req, res, next) => {
  try {
    const contact = await sfService.updateContact(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_CONTACT_UPDATED', entityType: 'StorefrontContact', entityId: contact.id, req });
    return ok(res, { contact });
  } catch (error) {
    next(error);
  }
});

// ===== Social =====

router.get('/social', async (req, res, next) => {
  try {
    const social = await sfService.getSocial(req.user!.shop!.id);
    return ok(res, { social });
  } catch (error) {
    next(error);
  }
});

router.patch('/social', write, validate(socialUpdateSchema), async (req, res, next) => {
  try {
    const social = await sfService.updateSocial(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_SOCIAL_UPDATED', entityType: 'StorefrontSocial', entityId: social.id, req });
    return ok(res, { social });
  } catch (error) {
    next(error);
  }
});

// ===== Branding =====

router.get('/branding', async (req, res, next) => {
  try {
    const branding = await sfService.getBranding(req.user!.shop!.id);
    return ok(res, { branding });
  } catch (error) {
    next(error);
  }
});

router.patch('/branding', write, validate(brandingUpdateSchema), async (req, res, next) => {
  try {
    const branding = await sfService.updateBranding(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_BRANDING_UPDATED', entityType: 'StorefrontBranding', entityId: branding.id, req });
    return ok(res, { branding });
  } catch (error) {
    next(error);
  }
});

// ===== SEO =====

router.get('/seo', async (req, res, next) => {
  try {
    const seo = await sfService.getSeo(req.user!.shop!.id);
    return ok(res, { seo });
  } catch (error) {
    next(error);
  }
});

router.patch('/seo', write, validate(seoUpdateSchema), async (req, res, next) => {
  try {
    const seo = await sfService.updateSeo(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_SEO_UPDATED', entityType: 'StorefrontSeo', entityId: seo.id, req });
    return ok(res, { seo });
  } catch (error) {
    next(error);
  }
});

// ===== Sections =====

router.get('/sections', async (req, res, next) => {
  try {
    const sections = await sfService.getSections(req.user!.shop!.id);
    return ok(res, { sections });
  } catch (error) {
    next(error);
  }
});

router.put('/sections', write, validate(sectionsUpdateSchema), async (req, res, next) => {
  try {
    const sections = await sfService.updateSections(req.user!.shop!.id, (req.body as { sections: { section: string; enabled: boolean; sortOrder: number }[] }).sections);
    await auditLog({ action: 'STOREFRONT_SECTIONS_UPDATED', entityType: 'StorefrontSection', req });
    return ok(res, { sections });
  } catch (error) {
    next(error);
  }
});

// ===== Featured products =====

router.get('/featured', async (req, res, next) => {
  try {
    const featured = await sfService.getFeatured(req.user!.shop!.id);
    return ok(res, { featured });
  } catch (error) {
    next(error);
  }
});

router.post('/featured', write, validate(featuredAddSchema), async (req, res, next) => {
  try {
    const featured = await sfService.addFeatured(req.user!.shop!.id, (req.body as { productId: string }).productId);
    await auditLog({ action: 'STOREFRONT_FEATURED_ADDED', entityType: 'StorefrontFeatured', entityId: featured.id, req });
    return created(res, { featured });
  } catch (error) {
    next(error);
  }
});

router.delete('/featured/:id', write, validate(idParamSchema, 'params'), async (req, res, next) => {
  try {
    await sfService.removeFeatured(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'STOREFRONT_FEATURED_REMOVED', entityType: 'StorefrontFeatured', entityId: req.params.id, req });
    return ok(res, { message: 'Featured product removed' });
  } catch (error) {
    next(error);
  }
});

router.put('/featured/reorder', write, validate(featuredReorderSchema), async (req, res, next) => {
  try {
    await sfService.reorderFeatured(req.user!.shop!.id, (req.body as { ids: string[] }).ids);
    return ok(res, { message: 'Featured products reordered' });
  } catch (error) {
    next(error);
  }
});

// ===== Features (Why Choose Us) =====

router.get('/features', async (req, res, next) => {
  try {
    const features = await sfService.listFeatures(req.user!.shop!.id);
    return ok(res, { features });
  } catch (error) {
    next(error);
  }
});

router.post('/features', write, validate(featureCreateSchema), async (req, res, next) => {
  try {
    const feature = await sfService.createFeature(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_FEATURE_ADDED', entityType: 'StorefrontFeature', entityId: feature.id, req });
    return created(res, { feature });
  } catch (error) {
    next(error);
  }
});

router.patch('/features/:id', write, validate(featureUpdateSchema), async (req, res, next) => {
  try {
    const feature = await sfService.updateFeature(req.user!.shop!.id, req.params.id, req.body);
    await auditLog({ action: 'STOREFRONT_FEATURE_UPDATED', entityType: 'StorefrontFeature', entityId: feature.id, req });
    return ok(res, { feature });
  } catch (error) {
    next(error);
  }
});

router.delete('/features/:id', write, async (req, res, next) => {
  try {
    await sfService.deleteFeature(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'STOREFRONT_FEATURE_DELETED', entityType: 'StorefrontFeature', entityId: req.params.id, req });
    return ok(res, { message: 'Feature deleted' });
  } catch (error) {
    next(error);
  }
});

router.put('/features/reorder', write, validate(reorderSchema), async (req, res, next) => {
  try {
    await sfService.reorderFeatures(req.user!.shop!.id, (req.body as { ids: string[] }).ids);
    return ok(res, { message: 'Features reordered' });
  } catch (error) {
    next(error);
  }
});

// ===== Testimonials =====

router.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await sfService.listTestimonials(req.user!.shop!.id);
    return ok(res, { testimonials });
  } catch (error) {
    next(error);
  }
});

router.post('/testimonials', write, validate(testimonialCreateSchema), async (req, res, next) => {
  try {
    const testimonial = await sfService.createTestimonial(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_TESTIMONIAL_ADDED', entityType: 'StorefrontTestimonial', entityId: testimonial.id, req });
    return created(res, { testimonial });
  } catch (error) {
    next(error);
  }
});

router.patch('/testimonials/:id', write, validate(testimonialUpdateSchema), async (req, res, next) => {
  try {
    const testimonial = await sfService.updateTestimonial(req.user!.shop!.id, req.params.id, req.body);
    await auditLog({ action: 'STOREFRONT_TESTIMONIAL_UPDATED', entityType: 'StorefrontTestimonial', entityId: testimonial.id, req });
    return ok(res, { testimonial });
  } catch (error) {
    next(error);
  }
});

router.delete('/testimonials/:id', write, async (req, res, next) => {
  try {
    await sfService.deleteTestimonial(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'STOREFRONT_TESTIMONIAL_DELETED', entityType: 'StorefrontTestimonial', entityId: req.params.id, req });
    return ok(res, { message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
});

router.put('/testimonials/reorder', write, validate(reorderSchema), async (req, res, next) => {
  try {
    await sfService.reorderTestimonials(req.user!.shop!.id, (req.body as { ids: string[] }).ids);
    return ok(res, { message: 'Testimonials reordered' });
  } catch (error) {
    next(error);
  }
});

// ===== FAQ =====

router.get('/faqs', async (req, res, next) => {
  try {
    const faqs = await sfService.listFaqs(req.user!.shop!.id);
    return ok(res, { faqs });
  } catch (error) {
    next(error);
  }
});

router.post('/faqs', write, validate(faqCreateSchema), async (req, res, next) => {
  try {
    const faq = await sfService.createFaq(req.user!.shop!.id, req.body);
    await auditLog({ action: 'STOREFRONT_FAQ_ADDED', entityType: 'StorefrontFaq', entityId: faq.id, req });
    return created(res, { faq });
  } catch (error) {
    next(error);
  }
});

router.patch('/faqs/:id', write, validate(faqUpdateSchema), async (req, res, next) => {
  try {
    const faq = await sfService.updateFaq(req.user!.shop!.id, req.params.id, req.body);
    await auditLog({ action: 'STOREFRONT_FAQ_UPDATED', entityType: 'StorefrontFaq', entityId: faq.id, req });
    return ok(res, { faq });
  } catch (error) {
    next(error);
  }
});

router.delete('/faqs/:id', write, async (req, res, next) => {
  try {
    await sfService.deleteFaq(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'STOREFRONT_FAQ_DELETED', entityType: 'StorefrontFaq', entityId: req.params.id, req });
    return ok(res, { message: 'FAQ deleted' });
  } catch (error) {
    next(error);
  }
});

router.put('/faqs/reorder', write, validate(reorderSchema), async (req, res, next) => {
  try {
    await sfService.reorderFaqs(req.user!.shop!.id, (req.body as { ids: string[] }).ids);
    return ok(res, { message: 'FAQs reordered' });
  } catch (error) {
    next(error);
  }
});

// ===== Navigation =====

router.get('/navigation', async (req, res, next) => {
  try {
    const navigation = await sfService.getNavigation(req.user!.shop!.id);
    return ok(res, { navigation });
  } catch (error) {
    next(error);
  }
});

router.put('/navigation', write, validate(navUpdateSchema), async (req, res, next) => {
  try {
    const navigation = await sfService.updateNavigation(req.user!.shop!.id, (req.body as { items: { id?: string; label: string; href: string; enabled: boolean }[] }).items);
    await auditLog({ action: 'STOREFRONT_NAVIGATION_UPDATED', entityType: 'StorefrontNavItem', req });
    return ok(res, { navigation });
  } catch (error) {
    next(error);
  }
});

export default router;
