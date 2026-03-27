export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCompanyId(companyId: string): Promise<User[]>;
}
