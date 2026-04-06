import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";
import { GeminiAIInsightService } from "@/modules/analytics/infrastructure/GeminiAIInsightService";

export async function POST(req: Request) {
    try {
        const { productName, datasetId } = await req.json();

        if (!productName || !datasetId) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        // 1. Get a larger sample to ensure we find the product
        const allRecords = await prisma.datasetRecord.findMany({
            where: { datasetId },
            take: 3000 // Scan up to 3k rows for total coverage
        });

        // 2. Hyper-Fuzzy search (Scoring based on word matches)
        const productKeywords = productName.toLowerCase().split(' ').filter((w: string) => w.length > 1);
        
        const scoredRows = allRecords.map(r => {
            const data = r.data as any;
            const dataStr = JSON.stringify(data).toLowerCase();
            let score = 0;
            productKeywords.forEach((k: string) => {
                if (dataStr.includes(k)) score++;
            });
            return { data, score };
        });

        // 3. Identified Product Rows (Sort by highest match score and take hits)
        const productRows = scoredRows
            .filter(r => r.score >= Math.ceil(productKeywords.length * 0.5))
            .sort((a, b) => {
                // First sort by keyword match score
                if (b.score !== a.score) return b.score - a.score;
                
                // Then sort by Sales (numeric)
                const salesA = parseFloat(String(a.data.Sales || 0));
                const salesB = parseFloat(String(b.data.Sales || 0));
                if (salesB !== salesA) return salesB - salesA;

                // Finally sort by MarketingSpend (numeric)
                const spendA = parseFloat(String(a.data.MarketingSpend || 0));
                const spendB = parseFloat(String(b.data.MarketingSpend || 0));
                return spendB - spendA;
            })
            .map(r => r.data);

        // 4. PRE-ANALYSIS: Extract Strategy Directly from Data (Fact-First)
        let excelStrategy: string | null = null;
        if (productRows.length > 0) {
            const row = productRows[0] as any;
            
            // Prioritize specific keywords and exclude "spend/cost" related ones
            const priorityKeys = ["marketingchannel", "canal", "channel", "social", "estrategia"];
            let strategyKey = Object.keys(row).find(k => 
                priorityKeys.some(p => k.toLowerCase() === p)
            );

            // If no exact match, search for inclusions but exclude spend/cost
            if (!strategyKey) {
                strategyKey = Object.keys(row).find(k => {
                    const lowKey = k.toLowerCase();
                    const isCandidate = ["canal", "channel", "marketing", "social", "estrategia"].some(s => lowKey.includes(s));
                    const isSpend = ["spend", "cost", "gasto", "gasto", "monto", "$"].some(s => lowKey.includes(s));
                    return isCandidate && !isSpend;
                });
            }

            if (strategyKey && row[strategyKey]) {
                excelStrategy = String(row[strategyKey]);
            }
        }

        // 5. Look for explicit platform mentions if no specific column found
        const platforms = ["pinterest", "instagram", "facebook", "tiktok", "whatsapp", "web", "tienda", "linkedin"];
        const detectedPlatform = excelStrategy || platforms.find(p => JSON.stringify(productRows).toLowerCase().includes(p));
        const hint = detectedPlatform ? (detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)) : null;

        // 6. Contextual selection: focus on matching rows
        const contextData = productRows.length > 0 
            ? productRows.slice(0, 15) 
            : allRecords.slice(0, 10).map(r => r.data);
            
        // 5. AI Service with hint
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

        const aiService = new GeminiAIInsightService(apiKey);
        const strategy = await aiService.generateProductMarketingStrategy(
            productName, 
            contextData, 
            detectedPlatform // Pass the manual hint
        );

        return NextResponse.json(strategy);
    } catch (e: any) {
        console.error("Product Strategy Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
