import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        records: { take: 10 }
      }
    });
    return NextResponse.json(dataset, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dataset.delete({ where: { id } });
    return NextResponse.json({ message: "Dataset deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
