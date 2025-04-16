const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all bills
    const bills = await prisma.bill.findMany();
    
    console.log(`Found ${bills.length} bills in the database:`);
    bills.forEach(bill => {
      console.log(`ID: ${bill.id}, Title: ${bill.title}, PDF: ${bill.pdfUrl}`);
    });
    
  } catch (error) {
    console.error('Error checking bills:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 