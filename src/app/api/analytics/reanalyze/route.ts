import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";
import { GeminiAIInsightService } from "@/modules/analytics/infrastructure/GeminiAIInsightService";
import { PrismaAnalysisRepository } from "@/modules/analytics/infrastructure/PrismaAnalysisRepository";
import { PrismaDatasetRepository } from "@/modules/datasets/infrastructure/PrismaDatasetRepository";
import { PrismaRecommendationRepository } from "@/modules/recommendations/infrastructure/PrismaRecommendationRepository";
import { GenerateAIAnalysis } from "@/modules/analytics/application/GenerateAIAnalysis";

export async function POST(req: Request) {
  try {
    const { datasetId } = await req.json();
    if (!datasetId) {
      return NextResponse.json({ error: "No datasetId provided" }, { status: 400 });
    }

    const aiService = new GeminiAIInsightService(process.env.GEMINI_API_KEY || "");
    const analysisRepo = new PrismaAnalysisRepository();
    const datasetRepo = new PrismaDatasetRepository();
    const recommendationRepo = new PrismaRecommendationRepository();
    
    // Cleanup old sessions to avoid showing "Pendiente" from failed past attempts
    await prisma.analysisSession.deleteMany({
        where: { datasetId }
    });

    const generateAnalysis = new GenerateAIAnalysis(
        aiService,
        analysisRepo,
        datasetRepo,
        recommendationRepo
    );

    const result = await generateAnalysis.execute(datasetId);

    return NextResponse.json({ 
        success: true, 
        message: "Analysis re-triggered successfully",
        session: result.session 
    });
  } catch (error) {
    console.error("Re-analysis Error:", error);
    return NextResponse.json({ error: "Failed to re-analyze dataset" }, { status: 500 });
  }
}
