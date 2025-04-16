const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // Step 1: Delete all existing chat messages (due to foreign key constraints)
    console.log('Deleting existing chat messages...');
    await prisma.chatMessage.deleteMany();
    
    // Step 2: Delete all existing bills
    console.log('Deleting existing bills...');
    await prisma.bill.deleteMany();
    
    // Get all PDF files from the public/pdfs directory
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
    
    console.log(`Found ${pdfFiles.length} PDF files in public/pdfs directory`);
    
    // Create bills for each PDF file
    const bills = pdfFiles.map(file => {
      // Convert the filename to a readable title
      const title = file
        .replace(/\.pdf$/, '')
        .replace(/_/g, ' ')
        .replace(/,/g, ',')
        .replace(/ {2,}/g, ' ');
      
      return {
        title: title,
        publicationDate: new Date(),
        pdfUrl: `/pdfs/${file}`,
      };
    });
    
    console.log('Creating bills in the database...');
    for (const bill of bills) {
      await prisma.bill.create({
        data: bill,
      });
      console.log(`Created bill: ${bill.title}`);
    }
    
    console.log('Database has been reset with actual PDF files');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 