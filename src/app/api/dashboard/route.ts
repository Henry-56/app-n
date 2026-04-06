import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const datasetIdParam = searchParams.get("datasetId");

    let companies = await prisma.company.findMany({ take: 1 });
    if (companies.length === 0) {
      const newCompany = await prisma.company.create({
        data: { name: "Demo Empresa", industry: "Pyme General" }
      });
      companies = [newCompany];
    }

    const company = companies[0];
    const companyId = company.id;

    // Get active dataset info
    let activeDatasetId = datasetIdParam === "null" ? null : datasetIdParam;
    let activeDatasetName = "Dataset por defecto";

    if (!activeDatasetId) {
      const latestDataset = await prisma.dataset.findFirst({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true }
      });
      activeDatasetId = latestDataset?.id ?? null;
      activeDatasetName = latestDataset?.name ?? "Sin Dataset";
    } else {
        const currentDataset = await prisma.dataset.findUnique({
            where: { id: activeDatasetId },
            select: { name: true }
        });
        activeDatasetName = currentDataset?.name ?? "Dataset Desconocido";
    }

    if (!activeDatasetId) {
       return NextResponse.json({ 
         company, 
         stats: { datasets: 0, users: 0, totalSales: "0", avgTicket: "0" },
         charts: { trend: [], categories: [] },
         recentTransactions: []
       });
    }

    // Fetch stats
    const datasetsCount = await prisma.dataset.count({ where: { companyId } });
    const usersCount = await prisma.user.count({ where: { companyId } });

    // Get analysis associated with THIS dataset
    const analysis = await prisma.analysisSession.findFirst({
        where: { datasetId: activeDatasetId },
        orderBy: { createdAt: 'desc' },
        include: { recommendations: true }
    });

    // Get records for aggregation
    const records = await prisma.datasetRecord.findMany({
        where: { datasetId: activeDatasetId },
        take: 1000 // Increased for modular analysis
    });

    const processedData = records.map(r => {
        const d = r.data as any;
        
        // Helper to find value from fuzzy keys
        const getFuzzy = (keys: string[], fallback: any = 0) => {
            const foundKey = Object.keys(d).find(k => 
                keys.some(search => k.toLowerCase().includes(search.toLowerCase()))
            );
            return foundKey ? d[foundKey] : fallback;
        };

        return {
            id: r.id,
            data: d,
            sales: Number(getFuzzy(['sale', 'amount', 'monto', 'total', 'precio'], 0)),
            category: String(getFuzzy(['category', 'categoria', 'tipo', 'segmento'], 'Otros')),
            product: String(getFuzzy(['product', 'item', 'articulo', 'sku'], 'General')),
            channel: String(getFuzzy(['channel', 'canal', 'medio', 'fuente'], 'Directo')),
            date: String(getFuzzy(['date', 'fecha', 'dia'], 'Sin Fecha'))
        };
    });
    
    // Aggregations
    const trendMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    let totalComputedSales = 0;

    processedData.forEach(item => {
        totalComputedSales += item.sales;
        
        const rawDate = item.date.toString();
        trendMap[rawDate] = (trendMap[rawDate] || 0) + item.sales;

        // Value Normalization for Visual Sync (e.g. "LAPTOP" -> "Laptop")
        const rawName = item.product !== 'General' ? item.product : item.category;
        const cat = rawName.trim().toLowerCase()
            .split(' ')
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
            
        categoryMap[cat] = (categoryMap[cat] || 0) + item.sales;
    });

    const trendData: any[] = Object.entries(trendMap)
      .map(([name, sales]) => ({ name, salesReal: sales, salesProjected: null }))
      .sort((a,b) => a.name.localeCompare(b.name));

    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

    const avgTicket = processedData.length > 0 ? totalComputedSales / processedData.length : 0;

    // AI Winners Alignment
    const findings = (analysis as any)?.findings;
    const aiWinnerProduct = findings?.strategicConsultation?.product?.winningProduct || categoryData[0]?.name || "General";
    const aiTopChannel = findings?.strategicConsultation?.marketing?.targetChannel || "Directo";
    const isDeterministic = findings?.strategicConsultation?.isDeterministic || false;

    // Calculate Top Product Participation for better "Sense"
    const topProdValue = categoryData.find(c => c.name === aiWinnerProduct)?.value || categoryData[0]?.value || 0;
    const topProductPercent = totalComputedSales > 0 ? (topProdValue / totalComputedSales * 100).toFixed(1) : "0";
    const topProductImpact = `${topProductPercent}% del Ingreso`;

    // Merge Forecast into Trend Data if available
    const predictions = (analysis as any)?.predictions;
    const finalTrendData = [...trendData];
    if (predictions?.projectedSales && trendData.length > 0) {
        // Add the last real point to the projection series to connect them
        const lastReal = trendData[trendData.length - 1];
        finalTrendData.push({ 
           name: "Próximo Mes (Proy.)", 
           salesReal: null,
           salesProjected: predictions.projectedSales,
           isPrediction: true 
        });
        // To connect perfectly, the last real point should also have a salesProjected value
        lastReal.salesProjected = lastReal.salesReal;
    }

    return NextResponse.json({
      company,
      activeDatasetId,
      activeDatasetName,
      stats: {
        datasets: datasetsCount,
        users: usersCount,
        analysis,
        totalSales: totalComputedSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        avgTicket: avgTicket.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        predictions: predictions || null,
        aiWinnerProduct,
        aiTopChannel,
        isDeterministic,
        topProductImpact,
        strategicConsultation: findings?.strategicConsultation
      },
      charts: {
          trend: finalTrendData,
          categories: categoryData,
          demandProjection: predictions?.expectedDemand || []
      },
      recentTransactions: processedData.map(p => ({ data: p.data })) // Original data for table display
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
