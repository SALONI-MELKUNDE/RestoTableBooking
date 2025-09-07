-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'RESTAURANT_OWNER';

-- AlterTable
ALTER TABLE "public"."MenuItem" ADD COLUMN     "allergens" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "ingredients" TEXT;

-- AlterTable
ALTER TABLE "public"."Restaurant" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'USA',
ADD COLUMN     "cuisine" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "zipCode" TEXT;
