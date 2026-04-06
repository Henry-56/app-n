import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json([], { status: 200 });

    const datasets = await prisma.dataset.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        fileSize: true,
        fileType: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json(datasets, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
