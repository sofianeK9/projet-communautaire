import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Nettoyer les données existantes
  await prisma.person.deleteMany();
  await prisma.mosque.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@annuaire.fr",
      password: hash,
      name: "Administrateur",
    },
  });

  // Mosquée Raja - Harnes
  const raja = await prisma.mosque.create({
    data: {
      name: "Mosquée Raja",
      address: "115b Rue Stalingrad",
      city: "Harnes",
      lat: 50.446863,
      lng: 2.886758,
    },
  });

  // Membres demo — rues réelles de Harnes
  const people = [
    {
      firstName: "Mohammed",
      lastName: "Benali",
      address: "12 Rue Victor Hugo",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4481,
      lng: 2.9012,
      phone: "06 12 34 56 78",
      mosqueId: raja.id,
    },
    {
      firstName: "Fatima",
      lastName: "Kadri",
      address: "35 Rue des Fusillés",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4495,
      lng: 2.9031,
      phone: "06 98 76 54 32",
      mosqueId: raja.id,
    },
    {
      firstName: "Youssef",
      lastName: "Rahimi",
      address: "8 Avenue Henri Barbusse",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4472,
      lng: 2.8981,
      mosqueId: raja.id,
    },
    {
      firstName: "Aicha",
      lastName: "Mansouri",
      address: "22 Rue Pasteur",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4468,
      lng: 2.9045,
      email: "aicha.mansouri@example.com",
      mosqueId: raja.id,
    },
    {
      firstName: "Ibrahim",
      lastName: "Touré",
      address: "5 Rue de Verdun",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4502,
      lng: 2.9018,
      mosqueId: raja.id,
    },
    {
      firstName: "Khadija",
      lastName: "El Ouafi",
      address: "17 Grand Place",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4488,
      lng: 2.9028,
    },
    {
      firstName: "Omar",
      lastName: "Cherkaoui",
      address: "3 Allée des Bouleaux",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4459,
      lng: 2.8972,
      mosqueId: raja.id,
    },
    {
      firstName: "Nadia",
      lastName: "Bensalem",
      address: "44 Rue Stalingrad",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4465,
      lng: 2.8891,
      mosqueId: raja.id,
    },
    {
      firstName: "Hamza",
      lastName: "Azzouzi",
      address: "9 Rue de Lorette",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.4511,
      lng: 2.9054,
      phone: "07 45 23 89 12",
      mosqueId: raja.id,
    },
    {
      firstName: "Soraya",
      lastName: "Benamara",
      address: "2 Avenue de la Paix",
      city: "Harnes",
      zipCode: "62440",
      lat: 50.447,
      lng: 2.8955,
    },
  ];

  for (const p of people) {
    await prisma.person.create({ data: p });
  }

  console.log("✅ Seed Harnes terminé");
  console.log("   Admin : admin@annuaire.fr / admin123");
  console.log("   1 mosquée : Mosquée Raja, 115b Rue Stalingrad, Harnes");
  console.log(`   ${people.length} membres créés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
