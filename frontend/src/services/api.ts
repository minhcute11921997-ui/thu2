import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface UploadedDocument {
  document_id: string;
  filename: string;
  stored_filename?: string;
  chunks_indexed: number;
}

export interface DatasetStats {
  dataset_name: string;
  total_chunks: number;
  total_documents: number;
}

export interface QueryResponse {
  answer: string;
  sources: string[];
}

export const getErrorMessage = (error: unknown, fallback = 'Khong the ket noi toi backend.') => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

export const uploadDocument = async (file: File): Promise<UploadedDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post<UploadedDocument>(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const listDocuments = async (): Promise<{ dataset: DatasetStats; documents: UploadedDocument[] }> => {
  const res = await axios.get<{ dataset: DatasetStats; documents: UploadedDocument[] }>(`${API_URL}/documents`);
  return res.data;
};

export const deleteDocument = async (documentId: string) => {
  const res = await axios.delete(`${API_URL}/documents/${documentId}`);
  return res.data;
};

export const queryDocument = async (question: string, conversationContext = ''): Promise<QueryResponse> => {
  const res = await axios.post<QueryResponse>(`${API_URL}/query`, {
    question,
    conversation_context: conversationContext,
  });
  return res.data;
};

export const summarizeDocument = async (documentId: string): Promise<{ summary: string }> => {
  const res = await axios.post<{ summary: string }>(`${API_URL}/summarize`, { document_id: documentId });
  return res.data;
};

export const getStats = async (): Promise<DatasetStats> => {
  const res = await axios.get<DatasetStats>(`${API_URL}/stats`);
  return res.data;
};
