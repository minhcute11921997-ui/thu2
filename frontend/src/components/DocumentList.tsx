import React, { useState } from 'react';
import { uploadDocument, summarizeDocument } from '../services/api';
import { UploadCloud, FileText, Loader2, Sparkles } from 'lucide-react';

interface Doc {
  id: string;
  name: string;
  summary?: string;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadDocument(file);
      setDocuments((prev: Doc[]) => [{ id: res.document_id, name: res.filename }, ...prev]);
    } catch (err) {
      alert('Upload thất bại.');
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async (id: string) => {
    setSummarizingId(id);
    try {
      const res = await summarizeDocument(id);
      setDocuments((p: Doc[]) => p.map((d: Doc) => d.id === id ? { ...d, summary: res.summary } : d));
    } catch { alert("Lỗi khi tạo tóm tắt"); }
    setSummarizingId(null);
  };

  return (
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Kho Lưu Trữ Local</h2>
      
      <div 
        className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-3xl p-12 text-center hover:bg-indigo-50 transition-colors"
        onDragOver={(e: React.DragEvent) => e.preventDefault()}
        onDrop={(e: React.DragEvent) => { e.preventDefault(); if(e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-indigo-900 font-semibold text-lg">Đang đọc, cắt chunk và Embed vector...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <UploadCloud className="w-10 h-10 text-indigo-500" />
            </div>
            <p className="text-gray-800 font-bold text-xl mb-2">Kéo thả file tài liệu vào đây</p>
            <p className="text-gray-500 font-medium mb-6">File của bạn sẽ được Vector hóa và lưu cục bộ, bảo mật 100%.</p>
            <label className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md cursor-pointer hover:bg-indigo-700 transition-all">
              Duyệt file
              <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files && handleUpload(e.target.files[0])} />
            </label>
          </div>
        )}
      </div>

      <div className="mt-10 space-y-4">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <span className="font-bold text-gray-800 text-lg">{doc.name}</span>
              </div>
              <button onClick={() => handleSummarize(doc.id)} disabled={summarizingId === doc.id || !!doc.summary} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50">
                {summarizingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {doc.summary ? 'Đã phân tích' : 'AI Tóm tắt'}
              </button>
            </div>
            {doc.summary && (
              <div className="mt-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> Nội dung tóm tắt:</p>
                <div className="prose prose-sm max-w-none text-slate-700">{doc.summary}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
