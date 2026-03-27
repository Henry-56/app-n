import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";
import { CSVParser } from "@/infrastructure/services/CSVParser";

export async function POST(req: Request) {
  try {
    console.log("--- UPLOAD START ---");
    const formData = await req.formData();
    const file = formData.get("file") as File;
    let companyId = formData.get("companyId") as string;
    const name = formData.get("name") as string || (file ? file.name : "unnamed");

    if (!file) {
      console.error("Upload error: No file provided");
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    console.log("File received:", name, "Size:", file.size);

    // Auto-select company if not provided (no-auth mode)
    if (!companyId) {
      console.log("No companyId provided, fetching first available...");
      const companies = await prisma.company.findMany({ take: 1 });
      if (companies.length > 0) {
        companyId = companies[0].id;
        console.log("Using companyId:", companyId);
      } else {
        // Create one on the fly if needed
        const newCompany = await prisma.company.create({
            data: { name: "Demo Empresa", industry: "Pyme General" }
        });
        companyId = newCompany.id;
        console.log("Created and using new companyId:", companyId);
      }
    }

    console.log("Parsing CSV...");
    const csvContent = await file.text();
    const records = CSVParser.parse(csvContent);
    console.log("CSV Parsed. Records:", records.length);

    console.log("Saving dataset to DB...");
    const dataset = await prisma.dataset.create({
      data: {
        name,
        companyId,
        records: {
          create: records.map(r => ({ data: r }))
        }
      },
      include: {
          records: true
      }
    });

    console.log("Dataset saved successfully. ID:", dataset.id);
    return NextResponse.json({ dataset, count: records.length }, { status: 201 });
  } catch (error: any) {
    console.error("--- UPLOAD CRASHED ---");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
