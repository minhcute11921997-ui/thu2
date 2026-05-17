import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const queryDocument = async (question: string) => {
    const res = await axios.post(`${API_URL}/query`, { question });
    return res.data;
};

export const summarizeDocument = async (documentId: string) => {
    const res = await axios.post(`${API_URL}/summarize`, { document_id: documentId });
    return res.data;
};

export const getStats = async () => {
    const res = await axios.get(`${API_URL}/stats`);
    return res.data;
};
