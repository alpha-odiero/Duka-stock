-- CreateEnum
CREATE TYPE "StorefrontStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- DropIndex
DROP INDEX "Order_customerId_idx";

-- DropIndex
DROP INDEX "Product_shopId_slug_key";

-- DropIndex
DROP INDEX "Sale_customerId_idx";

-- CreateTable
CREATE TABLE "Storefront" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "status" "StorefrontStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "storeName" TEXT,
    "tagline" TEXT,
    "heroImageUrl" TEXT,
    "heroImagePublicId" TEXT,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "faviconPublicId" TEXT,
    "copyright" TEXT,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "yearEstablished" INTEGER,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storefront_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontHero" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "primaryText" TEXT,
    "primaryLink" TEXT,
    "secondaryText" TEXT,
    "secondaryLink" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "backgroundEnabled" BOOLEAN NOT NULL DEFAULT false,
    "alignment" TEXT NOT NULL DEFAULT 'left',
    "show" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StorefrontHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontSection" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StorefrontSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontFeatured" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorefrontFeatured_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontAbout" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "title" TEXT,
    "introduction" TEXT,
    "story" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "values" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "secondaryImageUrl" TEXT,
    "secondaryImagePublicId" TEXT,
    "showTeam" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StorefrontAbout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontFeature" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorefrontFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontTestimonial" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "role" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorefrontTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontFaq" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorefrontFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontContact" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "whatsappMessage" TEXT,
    "email" TEXT,
    "location" TEXT,
    "address" TEXT,
    "mapsUrl" TEXT,
    "openingHours" JSONB,
    "showContactForm" BOOLEAN NOT NULL DEFAULT true,
    "showWhatsappBtn" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StorefrontContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontSocial" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "facebook" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "linkedin" TEXT,

    CONSTRAINT "StorefrontSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontBranding" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#176B5B',
    "secondaryColor" TEXT NOT NULL DEFAULT '#17252D',
    "accentColor" TEXT NOT NULL DEFAULT '#D6A84F',
    "buttonStyle" TEXT NOT NULL DEFAULT 'rounded',
    "radius" TEXT NOT NULL DEFAULT 'smooth',
    "font" TEXT NOT NULL DEFAULT 'inter',

    CONSTRAINT "StorefrontBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontNavItem" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorefrontNavItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontSeo" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImageUrl" TEXT,
    "ogImagePublicId" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,

    CONSTRAINT "StorefrontSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Storefront_shopId_key" ON "Storefront"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontHero_storefrontId_key" ON "StorefrontHero"("storefrontId");

-- CreateIndex
CREATE INDEX "StorefrontSection_storefrontId_idx" ON "StorefrontSection"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontSection_storefrontId_section_key" ON "StorefrontSection"("storefrontId", "section");

-- CreateIndex
CREATE INDEX "StorefrontFeatured_storefrontId_idx" ON "StorefrontFeatured"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontFeatured_storefrontId_productId_key" ON "StorefrontFeatured"("storefrontId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontAbout_storefrontId_key" ON "StorefrontAbout"("storefrontId");

-- CreateIndex
CREATE INDEX "StorefrontFeature_storefrontId_idx" ON "StorefrontFeature"("storefrontId");

-- CreateIndex
CREATE INDEX "StorefrontTestimonial_storefrontId_idx" ON "StorefrontTestimonial"("storefrontId");

-- CreateIndex
CREATE INDEX "StorefrontFaq_storefrontId_idx" ON "StorefrontFaq"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontContact_storefrontId_key" ON "StorefrontContact"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontSocial_storefrontId_key" ON "StorefrontSocial"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontBranding_storefrontId_key" ON "StorefrontBranding"("storefrontId");

-- CreateIndex
CREATE INDEX "StorefrontNavItem_storefrontId_idx" ON "StorefrontNavItem"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontSeo_storefrontId_key" ON "StorefrontSeo"("storefrontId");

-- AddForeignKey
ALTER TABLE "Storefront" ADD CONSTRAINT "Storefront_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontHero" ADD CONSTRAINT "StorefrontHero_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontSection" ADD CONSTRAINT "StorefrontSection_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontFeatured" ADD CONSTRAINT "StorefrontFeatured_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontFeatured" ADD CONSTRAINT "StorefrontFeatured_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontAbout" ADD CONSTRAINT "StorefrontAbout_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontFeature" ADD CONSTRAINT "StorefrontFeature_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontTestimonial" ADD CONSTRAINT "StorefrontTestimonial_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontFaq" ADD CONSTRAINT "StorefrontFaq_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontContact" ADD CONSTRAINT "StorefrontContact_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontSocial" ADD CONSTRAINT "StorefrontSocial_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontBranding" ADD CONSTRAINT "StorefrontBranding_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontNavItem" ADD CONSTRAINT "StorefrontNavItem_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontSeo" ADD CONSTRAINT "StorefrontSeo_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
