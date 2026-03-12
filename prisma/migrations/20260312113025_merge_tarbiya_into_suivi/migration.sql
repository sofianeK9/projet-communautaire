/*
  Warnings:

  - You are about to drop the `FicheTarbiya` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "FicheSuivi" ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'Homme',
ADD COLUMN     "presenceTaalimNissa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortieFemme" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortieHomme" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "FicheTarbiya";
