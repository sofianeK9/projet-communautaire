-- AlterTable
ALTER TABLE "Mosque" ADD COLUMN     "association" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "donationUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "mawaqitId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "services" TEXT[],
ADD COLUMN     "website" TEXT;
