import { Dataset, DatasetRepository, DatasetRecord } from "../domain/Dataset";
import { prisma } from "../../../infrastructure/persistence/PrismaClient";

export class PrismaDatasetRepository implements DatasetRepository {
  async save(dataset: Dataset): Promise<Dataset> {
    const saved = await prisma.dataset.upsert({
      where: { id: dataset.id },
      update: {
        name: dataset.name,
        description: dataset.description,
      },
      create: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        companyId: dataset.companyId,
      },
    });
    return {
        ...saved,
        description: saved.description ?? undefined
    };
  }

  async saveRecords(records: DatasetRecord[]): Promise<void> {
    await prisma.datasetRecord.createMany({
      data: records.map(r => ({
        id: r.id,
        datasetId: r.datasetId,
        data: r.data as any,
      })),
    });
  }

  async findById(id: string): Promise<Dataset | null> {
    const d = await prisma.dataset.findUnique({ where: { id } });
    if (!d) return null;
    return { ...d, description: d.description ?? undefined };
  }

  async findByCompanyId(companyId: string): Promise<Dataset[]> {
    const d = await prisma.dataset.findMany({ where: { companyId } });
    return d.map((x: any) => ({ ...x, description: x.description ?? undefined }));
  }

  async getRecords(datasetId: string): Promise<DatasetRecord[]> {
    const records = await prisma.datasetRecord.findMany({ where: { datasetId } });
    return records.map((r: any) => ({
      id: r.id,
      datasetId: r.datasetId,
      data: r.data as Record<string, any>,
      createdAt: r.createdAt,
    }));
  }
}
