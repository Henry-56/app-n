import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        dataset: { select: { name: true } }
      }
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, datasetId } = await req.json();

    if (!name || !type || !datasetId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        name,
        type,
        datasetId,
        data: {} // In a real app, you might save a snapshot of the stats here
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
