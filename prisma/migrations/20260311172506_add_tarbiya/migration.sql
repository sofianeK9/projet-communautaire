-- CreateTable
CREATE TABLE "FicheTarbiya" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "mosqueeAssidument" BOOLEAN NOT NULL DEFAULT false,
    "frequenceTaalim" TEXT,
    "participationActivite" BOOLEAN NOT NULL DEFAULT false,
    "sortie" BOOLEAN NOT NULL DEFAULT false,
    "situationFamiliale" TEXT,
    "telephone" TEXT,
    "divers" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FicheTarbiya_pkey" PRIMARY KEY ("id")
);
