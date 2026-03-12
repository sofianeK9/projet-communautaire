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

  return NextResponse.json(fiche, { status: 201 });
}
