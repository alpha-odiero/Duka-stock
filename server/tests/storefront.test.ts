import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, resetDb, disconnect } from './helpers';
import { hashPassword } from '../src/modules/auth/auth.service';
import { signToken, SESSION_COOKIE_NAME } from '../src/lib/session';

const app = createApp();
const BASE = '/api/v1';

async function registerUser(agent: ReturnType<typeof request.agent>, email: string, shopName: string, fullName = 'Test Owner') {
  const res = await agent.post(`${BASE}/auth/register`).send({
    fullName,
    email,
    phone: '+254722000000',
    password: 'StrongPass1',
    shopName,
    shopLocation: 'Nairobi',
  });
  expect(res.status).toBe(201);
  return res.body.data.user;
}

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await disconnect();
});

describe('storefront CMS', () => {
  it('creates an initialized storefront, updates hero + about + branding, and publishes', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `sf-${Date.now()}@test.app`, 'Green Mart');

    // Get the composite config (auto-initializes defaults)
    const init = await agent.get(`${BASE}/storefront`);
    expect(init.status).toBe(200);
    expect(init.body.data.storefront).toBeTruthy();
    expect(init.body.data.sections.length).toBeGreaterThan(0);
    expect(init.body.data.completeness.percent).toBeLessThan(100);
    expect(init.body.data.branding.primaryColor).toBe('#176B5B');

    // Update the main storefront record
    const infoRes = await agent.patch(`${BASE}/storefront`).send({ storeName: 'Green Mart', tagline: 'Fresh every day', copyright: '© 2026 Green Mart' });
    expect(infoRes.status).toBe(200);

    // Hero
    const heroRes = await agent.patch(`${BASE}/storefront/hero`).send({
      title: 'Quality Products. Better Prices.',
      subtitle: 'Shop everyday essentials',
      description: 'Trusted local goods delivered to you.',
      primaryText: 'Shop Now',
      primaryLink: '/shop',
      imageUrl: 'https://res.cloudinary.com/x/hero.jpg',
      alignment: 'center',
    });
    expect(heroRes.status).toBe(200);
    expect(heroRes.body.data.hero.title).toBe('Quality Products. Better Prices.');

    // About
    const aboutRes = await agent.patch(`${BASE}/storefront/about`).send({
      title: 'About Green Mart',
      story: 'We are a locally owned retail business.',
      mission: 'Serve our community with quality goods.',
      vision: 'A trusted local retail brand.',
    });
    expect(aboutRes.status).toBe(200);

    // Contact
    const contactRes = await agent.patch(`${BASE}/storefront/contact`).send({
      phone: '+254722111111',
      whatsappNumber: '+254722111111',
      whatsappMessage: 'Hello, I would like to enquire about your products.',
      email: 'hello@greenmart.test',
      openingHours: [
        { day: 'Monday - Friday', open: '8:00 AM', close: '7:00 PM' },
        { day: 'Saturday', open: '8:00 AM', close: '6:00 PM' },
      ],
    });
    expect(contactRes.status).toBe(200);

    // Branding
    const brandingRes = await agent.patch(`${BASE}/storefront/branding`).send({
      primaryColor: '#176B5B',
      accentColor: '#D6A84F',
      secondaryColor: '#17252D',
      buttonStyle: 'rounded',
    });
    expect(brandingRes.status).toBe(200);

    // Social
    const socialRes = await agent.patch(`${BASE}/storefront/social`).send({
      facebook: 'https://facebook.com/greenmart',
      instagram: 'https://instagram.com/greenmart',
    });
    expect(socialRes.status).toBe(200);

    // SEO
    const seoRes = await agent.patch(`${BASE}/storefront/seo`).send({
      title: 'Green Mart - Quality Everyday Products',
      description: 'Shop trusted everyday essentials from Green Mart.',
    });
    expect(seoRes.status).toBe(200);

    // Sections: reorder + disable newsletter, enable hero/categories
    const sectionsRes = await agent.put(`${BASE}/storefront/sections`).send({
      sections: [
        { section: 'hero', enabled: true, sortOrder: 0 },
        { section: 'categories', enabled: true, sortOrder: 1 },
        { section: 'featured', enabled: true, sortOrder: 2 },
        { section: 'newsletter', enabled: false, sortOrder: 11 },
      ],
    });
    expect(sectionsRes.status).toBe(200);

    // Add FAQ + testimonial
    const faqRes = await agent.post(`${BASE}/storefront/faqs`).send({ question: 'Do you offer delivery?', answer: 'Yes, within selected locations.' });
    expect(faqRes.status).toBe(201);
    const faqId = faqRes.body.data.faq.id;

    const testiRes = await agent.post(`${BASE}/storefront/testimonials`).send({
      customerName: 'John Kamau',
      content: 'Great service and very reliable.',
      rating: 5,
    });
    expect(testiRes.status).toBe(201);
    const testiId = testiRes.body.data.testimonial.id;

    // Update + delete FAQ
    const faqEdit = await agent.patch(`${BASE}/storefront/faqs/${faqId}`).send({ answer: 'Yes, we offer delivery.' });
    expect(faqEdit.status).toBe(200);
    await agent.delete(`${BASE}/storefront/faqs/${faqId}`).expect(200);

    // Delete testimonial
    await agent.delete(`${BASE}/storefront/testimonials/${testiId}`).expect(200);

    // Navigation: keep system links, add a custom one
    const navRes = await agent.put(`${BASE}/storefront/navigation`).send({
      items: [
        { label: 'Home', href: '/', enabled: true },
        { label: 'Shop', href: '/shop', enabled: true },
        { label: 'Offers', href: '/shop?category=Home', enabled: false },
      ],
    });
    expect(navRes.status).toBe(200);

    // Publish
    const pub = await agent.post(`${BASE}/storefront/publish`).send({ status: 'PUBLISHED' });
    expect(pub.status).toBe(200);
    expect(pub.body.data.storefront.status).toBe('PUBLISHED');

    // Completeness reflects the work done
    const done = await agent.get(`${BASE}/storefront/completeness`);
    expect(done.body.data.percent).toBeGreaterThan(0);
    expect(done.body.data.done).toBeGreaterThan(0);
  });

  it('supports featured products + features (why choose us)', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `feat-${Date.now()}@test.app`, 'Feature Mart');

    const prodRes = await agent.post(`${BASE}/products`).send({
      name: 'Cooking Oil 1L',
      sku: 'OIL-TEST',
      buyingPrice: 300,
      sellingPrice: 380,
      quantity: 20,
    });
    const productId = prodRes.body.data.product.id;

    // Add the product as featured
    const addRes = await agent.post(`${BASE}/storefront/featured`).send({ productId });
    expect(addRes.status).toBe(201);
    const featuredId = addRes.body.data.featured.id;

    // reorder (single item)
    await agent.put(`${BASE}/storefront/featured/reorder`).send({ ids: [featuredId] }).expect(200);

    // Why choose us features
    const feat = await agent.post(`${BASE}/storefront/features`).send({
      title: 'Quality Products',
      description: 'Carefully selected from trusted suppliers.',
    });
    expect(feat.status).toBe(201);
    const featId = feat.body.data.feature.id;
    await agent.patch(`${BASE}/storefront/features/${featId}`).send({ enabled: false }).expect(200);
    await agent.put(`${BASE}/storefront/features/reorder`).send({ ids: [featId] }).expect(200);
  });
});

describe('storefront security', () => {
  it('Shop A cannot modify Shop B storefront', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerUser(agentA, `seca-${Date.now()}@test.app`, 'Secure A');
    await registerUser(agentB, `secb-${Date.now()}@test.app`, 'Secure B');

    // both initialize their own storefronts
    await agentA.get(`${BASE}/storefront`).expect(200);
    await agentB.get(`${BASE}/storefront`).expect(200);

    // Shop A tries to read B's hero — hero is scoped to A only (returns A's empty hero)
    const heroRes = await agentA.get(`${BASE}/storefront/hero`);
    expect(heroRes.body.data.hero.storefrontId).toBeDefined();

    // Attempt to add a FAQ owned by a random uuid: it belongs to A's storefront
    const add = await agentA.post(`${BASE}/storefront/faqs`).send({ question: 'A question', answer: 'A answer' });
    expect(add.status).toBe(201);

    // Deleting a FAQ that belongs to Shop B via Shop A must return 404
    const bFaq = await agentB.post(`${BASE}/storefront/faqs`).send({ question: 'B question', answer: 'B answer' });
    const bFaqId = bFaq.body.data.faq.id;
    const del = await agentA.delete(`${BASE}/storefront/faqs/${bFaqId}`);
    expect(del.status).toBe(404);
  });

  it('unauthenticated users cannot access CMS routes', async () => {
    const res = await request(app).get(`${BASE}/storefront`);
    expect(res.status).toBe(401);
  });

  it('a cashier (attendant) cannot modify the storefront', async () => {
    const owner = request.agent(app);
    await registerUser(owner, `cashier-owner-${Date.now()}@test.app`, 'Cashier Mart');
    const me = await owner.get(`${BASE}/auth/me`);
    const shopId = me.body.data.shop.id;

    // Add an attendant member to the same shop directly.
    const attendant = await prisma.user.create({
      data: {
        fullName: 'Cashier User',
        email: `cashier-${Date.now()}@test.app`,
        phone: '+254733333333',
        passwordHash: await hashPassword('StrongPass1'),
        role: 'ATTENDANT',
        shopId,
      },
    });

    // Authenticate as the attendant via a signed session cookie.
    const cashierAgent = request.agent(app);
    cashierAgent.set('Cookie', `${SESSION_COOKIE_NAME}=${signToken(attendant.id)}`);

    // Reads are allowed.
    const read = await cashierAgent.get(`${BASE}/storefront`);
    expect(read.status).toBe(200);

    // Writes are forbidden.
    const writeFaq = await cashierAgent.post(`${BASE}/storefront/faqs`).send({ question: 'Q?', answer: 'A' });
    expect(writeFaq.status).toBe(403);
    const writeHero = await cashierAgent.patch(`${BASE}/storefront/hero`).send({ title: 'nope' });
    expect(writeHero.status).toBe(403);
    const writePublish = await cashierAgent.post(`${BASE}/storefront/publish`).send({ status: 'PUBLISHED' });
    expect(writePublish.status).toBe(403);
  });
});

describe('public storefront exposure', () => {
  it('public visitor sees marketing config but not private business data', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `pub-${Date.now()}@test.app`, 'Public Mart');

    await agent.patch(`${BASE}/storefront`).send({ storeName: 'Public Mart' });
    await agent.patch(`${BASE}/storefront/hero`).send({ title: 'Hello Public', imageUrl: 'https://x/hero.jpg' });
    await agent.patch(`${BASE}/storefront/about`).send({ story: 'Our story here.' });
    await agent.patch(`${BASE}/storefront/contact`).send({ phone: '+254700000000', whatsappNumber: '+254700000000' });
    await agent.post(`${BASE}/storefront/faqs`).send({ question: 'Delivery?', answer: 'Yes.' });
    await agent.post(`${BASE}/storefront/testimonials`).send({ customerName: 'Amina', content: 'Lovely.', rating: 5 });

    // create a product with internal details
    const prod = await agent.post(`${BASE}/products`).send({
      name: 'Sugar 2KG',
      sku: 'SUG-PUB',
      buyingPrice: 150,
      sellingPrice: 190,
      quantity: 8,
      lowStockThreshold: 2,
    });

    // Public config call (no auth), scoped to the 'Public Mart' shop by name.
    const res = await request(app).get(`${BASE}/store/config`).query({ shop: 'Public Mart' }).send();
    expect(res.status).toBe(200);
    const data = res.body.data;

    expect(data.storeName).toBe('Public Mart');
    expect(data.hero.title).toBe('Hello Public');
    expect(data.about.story).toBe('Our story here.');
    expect(data.contact.phone).toBe('+254700000000');
    expect(data.faqs.length).toBe(1);
    expect(data.testimonials.length).toBe(1);

    // featured product projection excludes buyingPrice/profit/threshold leakage into config
    const raw = JSON.stringify(data);
    expect(raw).not.toContain('buyingPrice');
    expect(raw).not.toContain('supplier');
    expect(raw).not.toContain('audit');
    expect(raw).not.toContain('password');

    // product did not get its private fields into the public config anyway (it
    // wasn't featured), and public product listing hides buyingPrice
    const prodList = await request(app).get(`${BASE}/store/products`).query({ shop: 'Public Mart' });
    expect(prodList.status).toBe(200);
    const json = JSON.stringify(prodList.body);
    expect(json).not.toContain('buyingPrice');
    expect(json).not.toContain('lowStockThreshold');
  });
});

// Keep a reference to prisma to avoid unused import lint warnings in some configs
void prisma;
