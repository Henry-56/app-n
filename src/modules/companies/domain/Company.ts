export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyRepository {
  save(company: Company): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
}
