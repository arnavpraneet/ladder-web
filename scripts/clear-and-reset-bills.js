const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Cleans up a bill title from a filename.
 */
function cleanBillTitle(filename) {
  // Remove the .pdf extension
  let title = filename.replace('.pdf', '');

  // Clean up the title
  title = title
    .replace(/_/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace('As passed by LS', '')
    .replace('as passed by LS', '')
    .replace('As introduced in LS', '')
    .replace('as introduced in LS', '')
    .replace('Bill Text', '')
    .replace('bill text', '')
    .replace('Bill,', 'Bill')
    .replace('Bill_', 'Bill ')
    .trim();

  // Ensure the title ends with a year
  if (!/\b(20\d{2})\b/.test(title)) {
    if (title.includes('2024')) {
      title = title.replace(/2024/, '2024');
    } else if (title.includes('2025')) {
      title = title.replace(/2025/, '2025');
    } else {
      title += ' 2024';
    }
  }

  return title;
}

/**
 * Process a bill and add it to the database
 */
async function processBill(bill) {
  console.log(`Creating bill: ${bill.title} (URL: "${bill.pdfUrl}")`);
  
  // Ensure the PDF URL has properly encoded spaces
  bill.pdfUrl = bill.pdfUrl.replace(/ /g, '%20');
  
  return prisma.bill.create({
    data: {
      title: bill.title,
      pdfUrl: bill.pdfUrl,
      category: bill.category || 'Uncategorized',
      status: 'active',
    },
  });
}

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
      const title = cleanBillTitle(file);
      
      return {
        title: title,
        publicationDate: new Date(),
        pdfUrl: `/pdfs/${file}`,
      };
    });
    
    console.log('Creating bills in the database...');
    for (const bill of bills) {
      await processBill(bill);
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