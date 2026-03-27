import { User, UserRepository } from "../domain/User";

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, companyId: string, name?: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error("User already exists");

    const user: User = {
      id: crypto.randomUUID(),
      email,
      companyId,
      name,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await this.userRepository.save(user);
  }
}
