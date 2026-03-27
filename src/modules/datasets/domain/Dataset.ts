export interface Dataset {
  id: string;
  name: string;
  description?: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetRecord {
  id: string;
  datasetId: string;
  data: Record<string, any>;
  createdAt: Date;
}

export interface DatasetRepository {
  save(dataset: Dataset): Promise<Dataset>;
  saveRecords(records: DatasetRecord[]): Promise<void>;
  findById(id: string): Promise<Dataset | null>;
  findByCompanyId(companyId: string): Promise<Dataset[]>;
  getRecords(datasetId: string): Promise<DatasetRecord[]>;
}
