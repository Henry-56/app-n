export interface StrategicRecommendation {
  id: string;
  analysisSessionId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impact?: string | null;
  createdAt: Date;
}

export interface RecommendationRepository {
  save(recommendation: StrategicRecommendation): Promise<StrategicRecommendation>;
  saveMany(recommendations: StrategicRecommendation[]): Promise<void>;
  findByAnalysisSessionId(sessionId: string): Promise<StrategicRecommendation[]>;
}
