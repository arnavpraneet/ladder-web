import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.chatMessage.deleteMany();
  await prisma.bill.deleteMany();

  // Create sample bills
  const bills = [
    {
      title: 'Education Reform Bill 2025',
      publicationDate: new Date('2025-03-15'),
      pdfUrl: '/pdfs/education-reform-bill.pdf',
    },
    {
      title: 'Climate Action Plan 2025',
      publicationDate: new Date('2025-03-10'),
      pdfUrl: '/pdfs/climate-action-plan.pdf',
    },
    {
      title: 'Healthcare Accessibility Act',
      publicationDate: new Date('2025-03-05'),
      pdfUrl: '/pdfs/healthcare-accessibility-act.pdf',
    },
    {
      title: 'Digital Privacy Protection Bill',
      publicationDate: new Date('2025-02-28'),
      pdfUrl: '/pdfs/digital-privacy-protection.pdf',
    },
    {
      title: 'Infrastructure Development Plan',
      publicationDate: new Date('2025-02-20'),
      pdfUrl: '/pdfs/infrastructure-development.pdf',
    },
    {
      title: 'Small Business Support Act',
      publicationDate: new Date('2025-02-15'),
      pdfUrl: '/pdfs/small-business-support.pdf',
    },
    {
      title: 'Renewable Energy Investment Bill',
      publicationDate: new Date('2025-02-10'),
      pdfUrl: '/pdfs/renewable-energy-investment.pdf',
    },
    {
      title: 'Public Transportation Funding Act',
      publicationDate: new Date('2025-02-05'),
      pdfUrl: '/pdfs/public-transportation-funding.pdf',
    },
    {
      title: 'Affordable Housing Initiative',
      publicationDate: new Date('2025-01-28'),
      pdfUrl: '/pdfs/affordable-housing-initiative.pdf',
    },
    {
      title: 'Veterans Support Bill',
      publicationDate: new Date('2025-01-20'),
      pdfUrl: '/pdfs/veterans-support.pdf',
    },
    {
      title: 'Mental Health Services Expansion',
      publicationDate: new Date('2025-01-15'),
      pdfUrl: '/pdfs/mental-health-services.pdf',
    },
    {
      title: 'Clean Water Act Amendment',
      publicationDate: new Date('2025-01-10'),
      pdfUrl: '/pdfs/clean-water-act.pdf',
    },
  ];

  for (const bill of bills) {
    await prisma.bill.create({
      data: bill,
    });
  }

  console.log('Database has been seeded with sample bills');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 