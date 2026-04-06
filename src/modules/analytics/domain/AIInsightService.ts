export interface AIInsightService {
  generateExecutiveSummary(data: any): Promise<string>;
  analyzeTrends(data: any): Promise<any>;
  projectScenario(data: any, scenario: string): Promise<any>;
  recommendActions(data: any): Promise<any[]>;
  detectRisks(data: any): Promise<any[]>;
  predictSalesAndDemand(data: any): Promise<any>;
  generateStrategicConsultation(data: any): Promise<any>;
}
