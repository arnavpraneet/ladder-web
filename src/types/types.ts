export interface Bill {
  id: string;
  title: string;
  publicationDate: string | Date;
  pdfUrl: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  createdAt: string | Date;
  billId?: string;
} 