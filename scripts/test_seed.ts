import { prisma } from "../src/infrastructure/persistence/PrismaClient";
import { CSVParser } from "../src/infrastructure/services/CSVParser";
import { GenerateAIAnalysis } from "../src/modules/analytics/application/GenerateAIAnalysis";
import { PrismaAnalysisRepository } from "../src/modules/analytics/infrastructure/PrismaAnalysisRepository";
import { GeminiAIInsightService } from "../src/modules/analytics/infrastructure/GeminiAIInsightService";
import { PrismaDatasetRepository } from "../src/modules/datasets/infrastructure/PrismaDatasetRepository";
import { PrismaRecommendationRepository } from "../src/modules/recommendations/infrastructure/PrismaRecommendationRepository";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("🚀 Starting E2E Test Seeding...");
    
    // 1. Get or Create Company
    let company = await prisma.company.findFirst();
    if (!company) {
        company = await prisma.company.create({
            data: { name: "Henry's Tech Solutions", industry: "Technology" }
        });
        console.log("✅ Created Demo Company");
    }

    // 2. Read and Parse CSV
    const csvPath = path.join(process.cwd(), "test_data_v2.csv");
    if (!fs.existsSync(csvPath)) {
        throw new Error("test_data_v2.csv not found");
    }
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = CSVParser.parse(csvContent);
    console.log(`✅ Parsed ${records.length} records from CSV`);

    // 3. Create Dataset
    const dataset = await prisma.dataset.create({
        data: {
            name: "Test Dataset V2 (Auto-Seed) " + new Date().toISOString(),
            companyId: company.id,
            fileSize: fs.statSync(csvPath).size,
            fileType: "csv",
            status: "PROCESSED",
            records: {
                create: records.map(r => ({ data: r as any }))
            }
        }
    });
    console.log(`✅ Dataset created ID: ${dataset.id}`);

    // 4. Trigger Analysis Logic
    console.log("🧠 Triggering AI Analysis (Gemini)...");
    const aiService = new GeminiAIInsightService(process.env.GEMINI_API_KEY || "");
    const analysisRepo = new PrismaAnalysisRepository();
    const datasetRepo = new PrismaDatasetRepository();
    const recommendationRepo = new PrismaRecommendationRepository();
    
    const generateAnalysis = new GenerateAIAnalysis(
        aiService,
        analysisRepo,
        datasetRepo,
        recommendationRepo
    );

    const result = await generateAnalysis.execute(dataset.id);
    
    console.log("✅ Analysis Completed!");
    console.log("📊 Predictions Generated:", (result.session as any).predictions ? "YES" : "NO");
    console.log("💡 Key Findings:", (result.session.findings as any).insights?.length || 0);
    console.log("🎯 Recommendations:", result.recommendations.length);

    console.log("\n✨ E2E Test Seeding Successful! You can now view the results on the Dashboard.");
}

main()
    .catch(e => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
