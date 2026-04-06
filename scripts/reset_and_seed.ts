import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING CLEAN SLATE & SEEDING ---');

  // 1. Wipe Everything (Order matters for FKs)
  console.log('1. Wiping database...');
  await prisma.analysisSession.deleteMany();
  await prisma.datasetRecord.deleteMany();
  await prisma.report.deleteMany();
  await prisma.dataset.deleteMany();
  console.log('   All datasets and sessions deleted.');

  // 2. Ensure Company exists
  let company = await prisma.company.findFirst();
  if (!company) {
    console.log('2. Creating default company...');
    company = await prisma.company.create({
      data: {
        name: 'Henry Business Group',
        industry: 'Diversified'
      }
    });
  }
  console.log(`   Working with Company: ${company.name}`);

  // 3. Define the Sample Files
  const samples = [
    { 
      name: 'Tecnología Premium', 
      file: 'tecnologia_premium.csv', 
      desc: 'Hardware de alto valor y bajo volumen.',
      content: `Date,Product,Category,Sales,MarketingChannel,MarketingSpend,Customer,Supplier
2026-01-05,Laptop Workstation Z,Technology,4500.00,LinkedIn Ads,600.00,TechCorp Intl,Computers Corp
2026-01-12,Server Pro 5000,Technology,8200.00,Direct Sales,0.00,Global Systems,ServerMaster
2026-02-15,MacBook Pro 16,Technology,2499.00,Google Search,350.00,Creative Studio,Apple Inc
2026-02-28,Monitor 8K Ultrawide,Technology,1800.00,Google Search,200.00,Individual User,DisplayCenter
2026-03-10,Laptop Workstation Z,Technology,4500.00,LinkedIn Ads,600.00,UniTech Lab,Computers Corp
2026-03-22,AI Graphics Card RTX,Technology,1599.00,Direct Sales,0.00,Mining Solutions,GPU Hub`
    },
    { 
      name: 'Consumo Masivo', 
      file: 'consumo_masivo.csv', 
      desc: 'Ventas de retail con alto volumen de transacciones.',
      content: `Date,Product,Category,Sales,MarketingChannel,MarketingSpend,Customer,Supplier
2026-03-01,Milk 1L,Grocery,1.50,SEO,0.00,Customer A,Finca Central
2026-03-01,Bread Pack,Snack,2.20,TikTok Ads,0.50,Customer B,PanArt
2026-03-01,Soda 2L,Beverage,3.50,Meta Ads,1.20,Customer C,SodaCo
2026-03-02,Milk 1L,Grocery,1.50,Direct,0.00,Customer D,Finca Central
2026-03-02,Cookies,Snack,1.20,TikTok Ads,0.40,Customer E,CookieFactory
2026-03-03,Beer 6-Pack,Beverage,8.99,Meta Ads,2.50,Customer F,Brewery Corp
2026-03-03,Chips,Snack,2.50,Meta Ads,0.80,Customer G,SnackWorld
2026-03-04,Milk 1L,Grocery,1.50,SEO,0.00,Customer H,Finca Central
2026-03-04,Fruit Juice,Beverage,2.80,Influencer,1.00,Customer I,JuiceLab
2026-03-05,Bread Pack,Snack,2.20,TikTok Ads,0.50,Customer J,PanArt
2026-03-05,Soda 2L,Beverage,3.50,Meta Ads,1.20,Customer K,SodaCo`
    },
    { 
      name: 'Mobiliario y Hogar', 
      file: 'mobiliario_hogar.csv', 
      desc: 'Artículos de hogar con estacionalidad marcada.',
      content: `Date,Product,Category,Sales,MarketingChannel,MarketingSpend,Customer,Supplier
2026-01-10,Seccional L 4 Plazas,Living Room,1200.00,Pinterest,80.00,Hogar Feliz,Muebles Pro
2026-01-15,Mesa Comedor Oak,Dining Room,850.00,Pinterest,60.00,Familia Garcia,Casa Wood
2026-02-05,Silla Ergonomica Pro,Office,299.00,Google Search,35.00,Teleworker Inc,ErgoDesign
2026-02-12,Escritorio Standing,Office,450.00,Google Search,50.00,Startup Hub,ErgoDesign
2026-02-20,Lampara Colgante,Lighting,120.00,Influencer,15.00,Deco Casa,LightStyle
2026-03-01,Seccional L 4 Plazas,Living Room,1200.00,Pinterest,80.00,Rentals Corp,Muebles Pro
2026-03-15,Cama Queen King size,Bedroom,950.00,Direct,0.00,Individual User,SleepCenter
2026-03-20,Escritorio Standing,Office,450.00,Catalog,25.00,Home Office Art,ErgoDesign`
    }
  ];

  // 4. Import each file
  for (const sample of samples) {
    console.log(`3. Processing ${sample.name}...`);
    const filePath = path.join(process.cwd(), 'public', 'samples', sample.file);

    // Save to public folder first
    fs.writeFileSync(filePath, sample.content);
    
    const records = parse(sample.content, {
      columns: true,
      skip_empty_lines: true
    });

    const dataset = await prisma.dataset.create({
      data: {
        name: sample.name,
        description: sample.desc,
        fileType: 'csv',
        companyId: company.id,
        status: 'PROCESSED'
      }
    });

    // Bulk create records
    await prisma.datasetRecord.createMany({
      data: records.map((row: any) => ({
        datasetId: dataset.id,
        data: row
      }))
    });

    console.log(`   Imported ${records.length} records for ${sample.name}.`);
  }

  console.log('--- RESET & SEEDING COMPLETE ---');
}

main()
  .catch(e => {
    console.error('Error during reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
