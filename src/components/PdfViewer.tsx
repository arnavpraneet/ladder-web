import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download } from 'lucide-react';

// Set up the worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/20 p-2 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn size={16} />
          </Button>
          
          <span className="text-sm text-muted-foreground px-2">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="h-8"
          >
            <ChevronLeft size={16} className="mr-1" />
            Prev
          </Button>
          
          <span className="text-sm text-muted-foreground px-2">
            Page {pageNumber} of {numPages || '?'}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="h-8"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8"
        >
          <a href={pdfUrl} download>
            <Download size={16} className="mr-1" />
            Download
          </a>
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar bg-muted/10 flex justify-center items-start">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <p className="text-destructive mb-2">Failed to load PDF.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
              </div>
            </div>
          }
          className="max-h-full"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="max-h-[calc(100vh-120px)]"
          />
        </Document>
      </div>
    </div>
  );
} 