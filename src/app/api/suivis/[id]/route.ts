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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const fiche = await prisma.ficheSuivi.findUnique({ where: { id } });
  if (!fiche) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
  return NextResponse.json(fiche);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = SuiviSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;

  try {
    const fiche = await prisma.ficheSuivi.update({
      where: { id },
      data: {
        ...rest,
        date: date ? new Date(date) : undefined,
      },
    });
    return NextResponse.json(fiche);
  } catch {
    return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.ficheSuivi.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
  }
}
