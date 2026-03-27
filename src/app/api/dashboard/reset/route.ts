import { prisma } from "@/infrastructure/persistence/PrismaClient";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const company = await prisma.company.findFirst();
    
    if (!company) {
      return NextResponse.json({ message: "No company found to reset" }, { status: 200 });
    }

    await prisma.dataset.deleteMany({
      where: { companyId: company.id }
    });

    return NextResponse.json({ message: "Data reset successful" }, { status: 200 });
  } catch (error: any) {
    console.error("Reset API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
