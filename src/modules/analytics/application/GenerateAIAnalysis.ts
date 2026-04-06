import { AIInsightService } from "../domain/AIInsightService";
import { AnalysisRepository } from "../domain/Analysis";
import { DatasetRepository } from "../../datasets/domain/Dataset";
import { RecommendationRepository } from "../../recommendations/domain/Recommendation";

export class GenerateAIAnalysis {
  constructor(
    private aiService: AIInsightService,
    private analysisRepository: AnalysisRepository,
    private datasetRepository: DatasetRepository,
    private recommendationRepository: RecommendationRepository
  ) {}

  async execute(datasetId: string) {
    const dataset = await this.datasetRepository.findById(datasetId);
    if (!dataset) throw new Error("Dataset not found");

    const records = await this.datasetRepository.getRecords(datasetId);
    const data = records.map(r => r.data);

    console.log("Analyzing trends for dataset:", datasetId);
    const findings = await this.aiService.analyzeTrends(data);
    console.log("Findings generated:", !!findings);

    console.log("Generating predictions (Sales & Demand)...");
    const predictions = await this.aiService.predictSalesAndDemand(data);
    console.log("Predictions generated:", !!predictions);

    console.log("Generating recommendations...");
    const recommendationList = await this.aiService.recommendActions(data);
    console.log("Recommendations generated:", recommendationList.length);

    console.log("Generating strategic consultation...");
    const strategicConsultation = await this.aiService.generateStrategicConsultation(data);
    console.log("Consultation generated:", !!strategicConsultation);

    console.log("Saving analysis session...");
    const session = await this.analysisRepository.save({
      id: crypto.randomUUID(),
      datasetId,
      findings: { 
          ...findings, 
          strategicConsultation 
      },
      predictions,
      status: "COMPLETED",
      createdAt: new Date(),
    });

    const recommendations = recommendationList.map(rec => ({
      id: crypto.randomUUID(),
      analysisSessionId: session.id,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      impact: rec.impact,
      createdAt: new Date(),
    }));

    if (recommendations.length > 0) {
      await this.recommendationRepository.saveMany(recommendations);
    }

    return { session, recommendations };
  }
}
