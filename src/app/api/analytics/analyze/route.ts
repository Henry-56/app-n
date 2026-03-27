import { NextResponse } from "next/server";
import { generateAIAnalysisUC } from "@/infrastructure/di";

export async function POST(req: Request) {
  try {
    const { datasetId } = await req.json();

    if (!datasetId) {
      return NextResponse.json({ error: "datasetId is required" }, { status: 400 });
    }

    const result = await generateAIAnalysisUC.execute(datasetId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
