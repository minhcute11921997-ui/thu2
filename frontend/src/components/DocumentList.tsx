import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, CheckCircle2, FileText, Loader2, RefreshCw, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import {
  deleteDocument,
  getErrorMessage,
  listDocuments,
  summarizeDocument,
  uploadDocument,
  type DatasetStats,
  type UploadedDocument,
} from '../services/api';

interface Doc {
  id: string;
  name: string;
  chunksIndexed: number;
  summary?: string;
}

interface DocumentListProps {
  datasetVersion: number;
  onDatasetChanged: () => void;
}

const ACCEPTED_FILE_TYPES = [
  '.pdf', '.docx', '.pptx', '.xlsx', '.xlsm', '.csv', '.tsv', '.json', '.xml', '.html', '.htm', '.rtf',
  '.txt', '.md', '.markdown', '.log', '.ini', '.conf', '.yaml', '.yml', '.sql', '.py', '.js', '.jsx',
  '.ts', '.tsx', '.java', '.cs', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.sh', '.bat', '.ps1',
].join(',');

const toDoc = (document: UploadedDocument): Doc => ({
  id: document.document_id,
  name: document.filename,
  chunksIndexed: document.chunks_indexed,
});

export default function DocumentList({ datasetVersion, onDatasetChanged }: DocumentListProps) {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [dataset, setDataset] = useState<DatasetStats>({ dataset_name: 'local_documents', total_chunks: 0, total_documents: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocuments();
      setDataset(data.dataset);
      setDocuments(data.documents.map(toDoc).reverse());
    } catch (err) {
      setError(getErrorMessage(err, 'Khong tai duoc bo du lieu.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, [datasetVersion]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await uploadDocument(file);
      setNotice(`Da them "${res.filename}" vao dataset voi ${res.chunks_indexed} chunks.`);
      await refreshDocuments();
      onDatasetChanged();
    } catch (err) {
      setError(getErrorMessage(err, 'Upload that bai.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Doc) => {
    const confirmed = window.confirm(`Xoa "${doc.name}" khoi dataset local? Hanh dong nay se xoa ca vector chunks va file goc da luu.`);
    if (!confirmed) return;

    setDeletingId(doc.id);
    setError(null);
    setNotice(null);
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
      setNotice(`Da xoa "${doc.name}" khoi dataset.`);
      await refreshDocuments();
      onDatasetChanged();
    } catch (err) {
      setError(getErrorMessage(err, 'Xoa tai lieu that bai.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSummarize = async (id: string) => {
    setSummarizingId(id);
    setError(null);
    try {
      const res = await summarizeDocument(id);
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, summary: res.summary } : doc)));
    } catch (err) {
      setError(getErrorMessage(err, 'Loi khi tao tom tat.'));
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Bo du lieu local</h2>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {dataset.total_documents} documents, {dataset.total_chunks} vector chunks. Them file moi se tao document moi; xoa file se go bo khoi truy van AI.
            </p>
          </div>
          <button onClick={refreshDocuments} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Lam moi
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {notice}
          </div>
        )}

        <div
          className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-10 text-center transition-colors hover:bg-indigo-50"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-indigo-600" />
              <p className="text-lg font-semibold text-indigo-950">Dang luu file va tao vector chunks...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <UploadCloud className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="mb-2 text-xl font-bold text-slate-900">Keo tha file vao bo du lieu</p>
              <p className="mb-6 max-w-xl text-sm font-medium text-slate-500">
                File goc duoc luu trong backend/uploads, noi dung duoc lap chi muc trong ChromaDB local.
              </p>
              <label className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                Chon file
                <input
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleUpload(file);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {loading && documents.length === 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Dang tai bo du lieu...
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-500">
              Chua co tai lieu nao trong dataset.
            </div>
          )}

          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-gray-800">{doc.name}</p>
                    <p className="text-sm font-medium text-gray-500">{doc.chunksIndexed} chunks trong dataset</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button onClick={() => handleSummarize(doc.id)} disabled={summarizingId === doc.id || Boolean(doc.summary)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">
                    {summarizingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {doc.summary ? 'Da tom tat' : 'Tom tat'}
                  </button>
                  <button onClick={() => handleDelete(doc)} disabled={deletingId === doc.id} className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">
                    {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Xoa
                  </button>
                </div>
              </div>

              {doc.summary && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-3 flex items-center gap-2 font-bold text-slate-800"><Sparkles className="h-4 w-4 text-amber-500" /> Noi dung tom tat</p>
                  <div className="prose prose-sm max-w-none text-slate-700">
                    <ReactMarkdown>{doc.summary}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
