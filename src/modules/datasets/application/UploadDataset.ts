import { Dataset, DatasetRepository, DatasetRecord } from "../domain/Dataset";

export class UploadDataset {
  constructor(private datasetRepository: DatasetRepository) {}

  async execute(name: string, companyId: string, records: any[], description?: string): Promise<Dataset> {
    const dataset: Dataset = {
      id: crypto.randomUUID(),
      name,
      companyId,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedDataset = await this.datasetRepository.save(dataset);

    const domainRecords: DatasetRecord[] = records.map(r => ({
      id: crypto.randomUUID(),
      datasetId: savedDataset.id,
      data: r,
      createdAt: new Date(),
    }));

    await this.datasetRepository.saveRecords(domainRecords);

    return savedDataset;
  }
}
