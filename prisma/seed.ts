import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  const company = await prisma.company.upsert({
    where: { id: "demo-company-id" },
    update: {},
    create: {
      id: "demo-company-id",
      name: "TecnoSoluciones Pyme",
      industry: "Tecnología y Retail",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "admin@tecnosoluciones.com" },
    update: {},
    create: {
      id: "demo-user-id",
      email: "admin@tecnosoluciones.com",
      name: "Administrador Demo",
      role: "ADMIN",
      companyId: company.id,
    },
  });

  console.log({ company, user });
  console.log("Seed finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
