'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Bill } from '@/types/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Fetch bills based on current page
  const fetchBills = useCallback(async () => {
    try {
      const response = await fetch(`/api/bills?page=${currentPage}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      
      const data = await response.json();
      setBills(data.bills);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  }, [currentPage]);

  // Handle bill selection
  const handleBillSelect = (bill: Bill) => {
    router.push(`/bills/${bill.id}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch bills on initial load and when page changes
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-4">
          <h1 className="text-3xl font-bold text-primary">Ladder</h1>
          <p className="text-muted-foreground">Browse and chat about government bills</p>
        </div>
      </header>
      
      <main className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Bills</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Showing page</span>
            <span className="font-medium text-foreground">{currentPage}</span>
            <span>of</span>
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          {bills.map((bill) => (
            <Card 
              key={bill.id} 
              className="hover:shadow-md transition-shadow cursor-pointer border-muted"
              onClick={() => handleBillSelect(bill)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-primary">{bill.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar size={14} className="mr-1" />
                  <span>Published: {format(new Date(bill.publicationDate), 'dd/MM/yyyy')}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 justify-end">
                <Button size="sm" variant="ghost" className="text-primary">
                  View details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {bills.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">No bills available</p>
          </div>
        )}
        
        <Separator className="mb-4" />
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-1">...</span>}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </main>
    </div>
  );
}
