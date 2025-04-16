import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Bill = {
  title: string;
  publicationDate: Date;
  pdfUrl: string;
};

async function main() {
  try {
    // Step 1: Delete all existing chat messages (due to foreign key constraints)
    console.log('Deleting existing chat messages...');
    await prisma.chatMessage.deleteMany();
    
    // Step 2: Delete all existing bills
    console.log('Deleting existing bills...');
    await prisma.bill.deleteMany();
    
    console.log('All existing bills and chat messages have been deleted.');

    // Step 3: Add your custom bills here
    // Example: Replace this array with your own bills and PDFs
    const myBills: Bill[] = [
      {
        title: 'My Custom Bill 1',
        publicationDate: new Date(),
        pdfUrl: '/pdfs/mycustombill1.pdf', // Make sure this file exists in public/pdfs/
      },
      {
        title: 'My Custom Bill 2',
        publicationDate: new Date(),
        pdfUrl: '/pdfs/mycustombill2.pdf', // Make sure this file exists in public/pdfs/
      },
      // Add more bills as needed
    ];
    
    // Step 4: Insert new bills
    console.log('Creating new bills...');
    for (const bill of myBills) {
      await prisma.bill.create({
        data: bill,
      });
      console.log(`Created bill: ${bill.title}`);
    }
    
    console.log('Database has been successfully updated with your custom bills.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 