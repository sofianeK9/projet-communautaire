import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SuiviSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  genre: z.string().default("Homme"),
  mosqueeAssidument: z.boolean().default(false),
  frequenceTaalim: z.string().optional().nullable(),
  participationActivite: z.boolean().default(false),
  sortieHomme: z.boolean().default(false),
  sortieFemme: z.boolean().default(false),
  presenceTaalimNissa: z.boolean().default(false),
  situationFamiliale: z.string().optional().nullable(),
  nombreEnfants: z.number().int().min(0).optional().nullable(),
  telephone: z.string().optional().nullable(),
  divers: z.string().optional().nullable(),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { nom: { contains: search, mode: "insensitive" as const } },
          { prenom: { contains: search, mode: "insensitive" as const } },
          { telephone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const fiches = await prisma.ficheSuivi.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(fiches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = SuiviSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const fiche = await prisma.ficheSuivi.create({
    data: {
      ...rest,
      date: date ? new Date(date) : new Date(),
    },
  });

  // Auto-ajout dans l'annuaire si la personne n'existe pas encore
  const existing = await prisma.person.findFirst({
    where: {
      firstName: { equals: parsed.data.prenom, mode: "insensitive" },
      lastName: { equals: parsed.data.nom, mode: "insensitive" },
    },
  });
  if (!existing) {
    await prisma.person.create({
      data: {
        firstName: parsed.data.prenom,
        lastName: parsed.data.nom,
        phone: parsed.data.telephone ?? null,
        address: "À compléter",
        city: "À compléter",
        zipCode: "00000",
      },
    });
  }

  return NextResponse.json({ ...fiche, personCreated: !existing }, { status: 201 });
}
