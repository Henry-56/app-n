import { StrategicRecommendation, RecommendationRepository } from "../domain/Recommendation";
import { prisma } from "../../../infrastructure/persistence/PrismaClient";

export class PrismaRecommendationRepository implements RecommendationRepository {
  async save(recommendation: StrategicRecommendation): Promise<StrategicRecommendation> {
    const saved = await prisma.strategicRecommendation.upsert({
      where: { id: recommendation.id },
      update: {
        title: recommendation.title,
        description: recommendation.description,
        priority: recommendation.priority,
        impact: recommendation.impact,
      },
      create: {
        id: recommendation.id,
        analysisSessionId: recommendation.analysisSessionId,
        title: recommendation.title,
        description: recommendation.description,
        priority: recommendation.priority,
        impact: recommendation.impact,
      },
    });
    return {
        ...saved,
        priority: saved.priority as any
    };
  }

  async saveMany(recommendations: StrategicRecommendation[]): Promise<void> {
    await prisma.strategicRecommendation.createMany({
      data: recommendations.map(r => ({
        id: r.id,
        analysisSessionId: r.analysisSessionId,
        title: r.title,
        description: r.description,
        priority: r.priority,
        impact: r.impact,
      })),
    });
  }

  async findByAnalysisSessionId(sessionId: string): Promise<StrategicRecommendation[]> {
    const recs = await prisma.strategicRecommendation.findMany({ where: { analysisSessionId: sessionId } });
    return recs.map((r: any) => ({
        ...r,
        priority: r.priority as any
    }));
  }
}
