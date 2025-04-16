import React from 'react';
import { format } from 'date-fns';
import type { Bill } from '@/types/types';

interface BillListProps {
  bills: Bill[];
  currentPage: number;
  totalPages: number;
  selectedBillId: string | null;
  onBillSelect: (bill: Bill) => void;
  onPageChange: (page: number) => void;
}

export default function BillList({
  bills,
  currentPage,
  totalPages,
  selectedBillId,
  onBillSelect,
  onPageChange,
}: BillListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {bills.map((bill) => (
            <li key={bill.id}>
              <button
                onClick={() => onBillSelect(bill)}
                className={`w-full text-left p-4 rounded-md transition-colors ${
                  selectedBillId === bill.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white hover:bg-purple-50'
                }`}
              >
                <h3 className="font-medium">{bill.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(bill.publicationDate), 'dd/MM/yyyy')}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between py-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 