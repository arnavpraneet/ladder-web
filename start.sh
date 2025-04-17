#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx prisma db push --skip-generate

# Seed the database with PDF-based bills
echo "Seeding the database with bills from PDFs..."
node scripts/seed-from-pdfs.js

# Start the application
echo "Starting the application..."
exec npm run start 