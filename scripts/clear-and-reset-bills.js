const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
    const myBills = [
      {
        title: 'THE PROTECTION OF INTERESTS IN AIRCRAFT OBJECTS BILL, 2025',
        publicationDate: new Date(),
        pdfUrl: '/pdfs/Protection_of_Interests_in_Aircraft_Objects_Bill_2025.pdf', // Make sure this file exists in public/pdfs/
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