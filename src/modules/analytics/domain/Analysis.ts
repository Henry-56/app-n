export interface AnalysisSession {
  id: string;
  datasetId: string;
  findings: any; // Structured JSON from Gemini
  predictions?: any; // Projected metadata
  status: string;
  createdAt: Date;
}

export interface AnalysisRepository {
  save(analysis: AnalysisSession): Promise<AnalysisSession>;
  findById(id: string): Promise<AnalysisSession | null>;
  findByDatasetId(datasetId: string): Promise<AnalysisSession[]>;
}
