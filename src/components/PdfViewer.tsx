'use client';

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [fullPdfUrl, setFullPdfUrl] = useState('');
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Set up the viewer on client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Set full URL path for the PDF
      const origin = window.location.origin;
      // Ensure the URL is properly encoded
      const encodedPath = pdfUrl.split('/').map(part => encodeURIComponent(part)).join('/');
      const url = pdfUrl.startsWith('http') ? pdfUrl : `${origin}${encodedPath}`;
      console.log('PDF URL to be loaded:', url);
      setFullPdfUrl(url);
      setIsClient(true);
    } catch (err) {
      console.error('Error initializing PDF viewer:', err);
      setLoadError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [pdfUrl]);

  function reloadPdf() {
    if (typeof window !== 'undefined') {
      const timestamp = new Date().getTime();
      window.location.href = window.location.pathname + '?t=' + timestamp;
    }
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error, show the error message
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load PDF</p>
          <p className="text-sm text-muted-foreground mb-4">
            Error: {loadError.message}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reloadPdf}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/20 p-2 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            PDF Viewer
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8"
        >
          <a href={fullPdfUrl} download>
            <Download size={16} className="mr-1" />
            Download
          </a>
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden bg-muted/10">
        {fullPdfUrl && (
          <object
            data={fullPdfUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Unable to display PDF. Please{' '}
                <a 
                  href={fullPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  download
                </a>{' '}
                to view it.
              </p>
            </div>
          </object>
        )}
      </div>
    </div>
  );
} 