import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const record = await prisma.datasetRecord.findFirst();
    if (record) {
        console.log("--- DATA JSON KEYS ---");
        console.log(JSON.stringify(Object.keys(record.data as object), null, 2));
        console.log("--- SAMPLE DATA ---");
        console.log(JSON.stringify(record.data, null, 2));
    } else {
        console.log("No records found.");
    }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
