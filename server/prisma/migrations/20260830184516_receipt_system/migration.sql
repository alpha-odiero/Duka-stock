-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'PARTIALLY_PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "amountPaid" DECIMAL(12,2),
ADD COLUMN     "changeDue" DECIMAL(12,2),
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
ADD COLUMN     "registerName" TEXT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "address" TEXT,
ADD COLUMN     "businessPin" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "receiptFooter" TEXT,
ADD COLUMN     "registerName" TEXT NOT NULL DEFAULT 'POS-01',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
ADD COLUMN     "website" TEXT;
