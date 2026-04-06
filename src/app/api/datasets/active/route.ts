import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../infrastructure/persistence/PrismaClient";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const datasetId = searchParams.get("datasetId");

        if (datasetId) {
            const dataset = await prisma.dataset.findUnique({
                where: { id: datasetId },
                select: { id: true, name: true }
            });
            return NextResponse.json({
                activeDatasetId: dataset?.id,
                activeDatasetName: dataset?.name
            });
        }

        // Fallback to latest
        const latestDataset = await prisma.dataset.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true }
        });

        return NextResponse.json({
            activeDatasetId: latestDataset?.id,
            activeDatasetName: latestDataset?.name
        });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to fetch active dataset" }, { status: 500 });
    }
}

