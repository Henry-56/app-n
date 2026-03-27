import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/PrismaClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // For a no-auth prototype, we just grab the first company available
    let companies = await prisma.company.findMany({ take: 1 });
    
    if (companies.length === 0) {
      // Create a default company if none exists
      const newCompany = await prisma.company.create({
        data: {
          name: "Demo Empresa",
          industry: "Pyme General",
        }
      });
      companies = [newCompany];
    }

    const company = companies[0];
    const companyId = company.id;

    // Fetch stats directly
    const datasetsCount = await prisma.dataset.count({ where: { companyId } });
    const usersCount = await prisma.user.count({ where: { companyId } });

    // Get latest dataset ID
    const latestDataset = await prisma.dataset.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
    });
    const latestDatasetId = latestDataset?.id;

    // Get latest analysis session if exists
    const latestAnalysis = await prisma.analysisSession.findFirst({
        where: { dataset: { companyId } },
        orderBy: { createdAt: 'desc' },
        include: { recommendations: true }
    });

    // Get all records of the latest dataset for aggregation
    const records = latestDatasetId ? await prisma.datasetRecord.findMany({
        where: { datasetId: latestDatasetId },
        take: 100 // Limit for prototype performance
    }) : [];

    const processedData = records.map(r => r.data as any);
    
    // Aggregate by date (Trend)
    const trendMap: Record<string, number> = {};
    processedData.forEach(item => {
        const date = item.date || 'Unknown';
        trendMap[date] = (trendMap[date] || 0) + Number(item.sales || 0);
    });
    const trendData = Object.entries(trendMap).map(([name, sales]) => ({ name, sales })).sort((a,b) => a.name.localeCompare(b.name));

    // Aggregate by category
    const categoryMap: Record<string, number> = {};
    processedData.forEach(item => {
        const cat = item.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(item.sales || 0);
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Stats
    const totalSales = processedData.reduce((acc, item) => acc + Number(item.sales || 0), 0);
    const avgTicket = processedData.length > 0 ? totalSales / processedData.length : 0;

    return NextResponse.json({
      company,
      stats: {
        datasets: datasetsCount,
        users: usersCount,
        latestAnalysis,
        latestDatasetId,
        totalSales: totalSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        avgTicket: avgTicket.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      },
      charts: {
          trend: trendData.length > 0 ? trendData : [
            { name: 'Ene', sales: 0 },
            { name: 'Feb', sales: 0 },
            { name: 'Mar', sales: 0 }
          ],
          categories: categoryData
      },
      recentTransactions: processedData.slice(0, 5) // Last 5 for the table
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
