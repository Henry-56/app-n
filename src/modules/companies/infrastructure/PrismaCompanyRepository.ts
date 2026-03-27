import { Company, CompanyRepository } from "../domain/Company";
import { prisma } from "../../../infrastructure/persistence/PrismaClient";

export class PrismaCompanyRepository implements CompanyRepository {
  async save(company: Company): Promise<Company> {
    const saved = await prisma.company.upsert({
      where: { id: company.id },
      update: {
        name: company.name,
        industry: company.industry,
      },
      create: {
        id: company.id,
        name: company.name,
        industry: company.industry,
      },
    });
    return saved;
  }

  async findById(id: string): Promise<Company | null> {
    return await prisma.company.findUnique({ where: { id } });
  }

  async findAll(): Promise<Company[]> {
    return await prisma.company.findMany();
  }
}
