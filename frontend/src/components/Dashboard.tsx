import { useEffect, useState } from 'react';
import { Activity, Database, FileText, RefreshCw, Server } from 'lucide-react';
import { getStats, type DatasetStats } from '../services/api';

interface DashboardProps {
  refreshKey: number;
}

export default function Dashboard({ refreshKey }: DashboardProps) {
  const [stats, setStats] = useState<DatasetStats>({ dataset_name: 'local_documents', total_chunks: 0, total_documents: 0 });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      setStats(await getStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  return (
    <div className="mx-auto max-w-6xl p-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
          <Activity className="h-8 w-8 text-blue-600" /> Dataset Health
        </h2>
        <button onClick={loadStats} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Lam moi
        </button>
      </div>
      <div className="mb-8 grid grid-cols-3 gap-6">
        <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100"><FileText className="h-7 w-7 text-blue-600" /></div>
          <div><p className="mb-1 font-semibold text-gray-500">Documents</p><h3 className="text-3xl font-black text-gray-800">{stats.total_documents}</h3></div>
        </div>
        <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100"><Database className="h-7 w-7 text-purple-600" /></div>
          <div><p className="mb-1 font-semibold text-gray-500">Vector Chunks</p><h3 className="text-3xl font-black text-gray-800">{stats.total_chunks}</h3></div>
        </div>
        <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100"><Server className="h-7 w-7 text-emerald-600" /></div>
          <div><p className="mb-1 font-semibold text-gray-500">Dataset</p><h3 className="mt-1 text-xl font-bold text-emerald-600">{stats.dataset_name}</h3></div>
        </div>
      </div>
      <div className="rounded-xl bg-slate-900 p-8 text-white shadow-xl">
        <h4 className="mb-3 text-xl font-bold">Local dataset behavior</h4>
        <p className="font-medium leading-relaxed text-slate-300">
          Them file se luu file goc trong backend/uploads va tao vector chunks trong ChromaDB. Xoa file se xoa ca chunks khoi dataset va xoa file goc da luu.
        </p>
      </div>
    </div>
  );
}
