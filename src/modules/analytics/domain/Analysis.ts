export interface AnalysisSession {
  id: string;
  datasetId: string;
  findings: any; // Structured JSON from Gemini
  status: string;
  createdAt: Date;
}

export interface AnalysisRepository {
  save(analysis: AnalysisSession): Promise<AnalysisSession>;
  findById(id: string): Promise<AnalysisSession | null>;
  findByDatasetId(datasetId: string): Promise<AnalysisSession[]>;
}
