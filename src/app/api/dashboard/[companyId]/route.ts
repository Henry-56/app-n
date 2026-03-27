import { NextResponse } from "next/server";
import { repos } from "@/infrastructure/di";

export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = params.companyId;

    const company = await repos.companyRepo.findById(companyId);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const datasets = await repos.datasetRepo.findByCompanyId(companyId);
    const users = await repos.userRepo.findByCompanyId(companyId);

    // Get latest analysis session if exists
    let latestAnalysis = null;
    if (datasets.length > 0) {
        const sessions = await repos.analysisRepo.findByDatasetId(datasets[0].id);
        if (sessions.length > 0) {
            latestAnalysis = sessions[0];
            const recs = await repos.recommendationRepo.findByAnalysisSessionId(latestAnalysis.id);
            (latestAnalysis as any).recommendations = recs;
        }
    }

    return NextResponse.json({
      company,
      stats: {
        datasets: datasets.length,
        users: users.length,
        latestAnalysis
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
