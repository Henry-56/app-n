import { AnalysisSession, AnalysisRepository } from "../domain/Analysis";
import { prisma } from "../../../infrastructure/persistence/PrismaClient";

export class PrismaAnalysisRepository implements AnalysisRepository {
  async save(analysis: AnalysisSession): Promise<AnalysisSession> {
    const saved = await prisma.analysisSession.upsert({
      where: { id: analysis.id },
      update: {
        findings: analysis.findings as any,
        status: analysis.status,
      },
      create: {
        id: analysis.id,
        datasetId: analysis.datasetId,
        findings: analysis.findings as any,
        status: analysis.status,
      },
    });
    return {
        ...saved,
        findings: saved.findings as any
    };
  }

  async findById(id: string): Promise<AnalysisSession | null> {
    const s = await prisma.analysisSession.findUnique({ where: { id } });
    if (!s) return null;
    return { ...s, findings: s.findings as any };
  }

  async findByDatasetId(datasetId: string): Promise<AnalysisSession[]> {
    const sessions = await prisma.analysisSession.findMany({ where: { datasetId } });
    return sessions.map((s: any) => ({ ...s, findings: s.findings as any }));
  }
}
