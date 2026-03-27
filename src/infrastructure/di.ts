import { PrismaCompanyRepository } from "@/modules/companies/infrastructure/PrismaCompanyRepository";
import { PrismaUserRepository } from "@/modules/users/infrastructure/PrismaUserRepository";
import { PrismaDatasetRepository } from "@/modules/datasets/infrastructure/PrismaDatasetRepository";
import { PrismaAnalysisRepository } from "@/modules/analytics/infrastructure/PrismaAnalysisRepository";
import { PrismaRecommendationRepository } from "@/modules/recommendations/infrastructure/PrismaRecommendationRepository";
import { GeminiAIInsightService } from "@/modules/analytics/infrastructure/GeminiAIInsightService";
import { CreateCompany } from "@/modules/companies/application/CreateCompany";
import { RegisterUser } from "@/modules/users/application/RegisterUser";
import { UploadDataset } from "@/modules/datasets/application/UploadDataset";
import { GenerateAIAnalysis } from "@/modules/analytics/application/GenerateAIAnalysis";

// Repositories
const companyRepo = new PrismaCompanyRepository();
const userRepo = new PrismaUserRepository();
const datasetRepo = new PrismaDatasetRepository();
const analysisRepo = new PrismaAnalysisRepository();
const recommendationRepo = new PrismaRecommendationRepository();

// AI Service
const aiService = new GeminiAIInsightService(process.env.GEMINI_API_KEY || "");

// Use Cases
export const createCompanyUC = new CreateCompany(companyRepo);
export const registerUserUC = new RegisterUser(userRepo);
export const uploadDatasetUC = new UploadDataset(datasetRepo);
export const generateAIAnalysisUC = new GenerateAIAnalysis(
  aiService,
  analysisRepo,
  datasetRepo,
  recommendationRepo
);

export const repos = { companyRepo, userRepo, datasetRepo, analysisRepo, recommendationRepo };
