/*
  Warnings:

  - You are about to drop the column `sortie` on the `FicheTarbiya` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FicheTarbiya" DROP COLUMN "sortie",
ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'Homme',
ADD COLUMN     "presenceTaalimNissa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortieFemme" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortieHomme" BOOLEAN NOT NULL DEFAULT false;
