import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";
import { CSVParser } from "@/infrastructure/services/CSVParser";
import { ExcelParser } from "@/infrastructure/services/ExcelParser";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.log("--- UPLOAD START ---");
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    let companyId = formData.get("companyId") as string;

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    // Auto-select company if not provided (no-auth mode)
    if (!companyId) {
      const companies = await prisma.company.findMany({ take: 1 });
      if (companies.length > 0) {
        companyId = companies[0].id;
      } else {
        const newCompany = await prisma.company.create({
            data: { name: "Demo Empresa", industry: "Pyme General" }
        });
        companyId = newCompany.id;
      }
    }

    const uploadedDatasets = [];

    for (const file of files) {
      const name = file.name;
      const type = name.endsWith('.xlsx') ? 'xlsx' : 'csv';
      const size = file.size;

      console.log(`Processing file: ${name}, Type: ${type}, Size: ${size}`);

      let records = [];
      if (type === 'xlsx') {
        const buffer = Buffer.from(await file.arrayBuffer());
        records = ExcelParser.parse(buffer);
      } else {
        const csvContent = await file.text();
        records = CSVParser.parse(csvContent);
      }

      const dataset = await prisma.dataset.create({
        data: {
          name,
          companyId,
          fileSize: size,
          fileType: type,
          status: "PROCESSED",
          records: {
            create: records.map(r => ({ data: r }))
          }
        }
      });
      uploadedDatasets.push(dataset);
    }

    return NextResponse.json({ datasets: uploadedDatasets, count: files.length }, { status: 201 });
  } catch (error: any) {
    console.error("--- UPLOAD CRASHED ---", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
