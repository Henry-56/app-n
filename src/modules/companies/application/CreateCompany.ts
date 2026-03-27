import { Company, CompanyRepository } from "../domain/Company";

export class CreateCompany {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(name: string, industry?: string): Promise<Company> {
    const company: Company = {
      id: crypto.randomUUID(),
      name,
      industry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await this.companyRepository.save(company);
  }
}
