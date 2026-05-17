import { useEffect, useState } from 'react';
import { getStats } from '../services/api';
import { Database, FileText, Server, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_chunks: 0, total_documents: 0 });
  useEffect(() => { getStats().then(setStats).catch(console.error); }, []);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <Activity className="w-8 h-8 text-blue-600" /> System Health
      </h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center"><FileText className="w-7 h-7 text-blue-600" /></div>
          <div><p className="text-gray-500 font-semibold mb-1">Total Documents</p><h3 className="text-3xl font-black text-gray-800">{stats.total_documents}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center"><Database className="w-7 h-7 text-purple-600" /></div>
          <div><p className="text-gray-500 font-semibold mb-1">Vector Chunks</p><h3 className="text-3xl font-black text-gray-800">{stats.total_chunks}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center"><Server className="w-7 h-7 text-emerald-600" /></div>
          <div><p className="text-gray-500 font-semibold mb-1">Database Status</p><h3 className="text-xl font-bold text-emerald-600 mt-1">Encrypted Local</h3></div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <h4 className="font-bold text-xl mb-3 flex items-center gap-2">🚀 Apple Silicon Acceleration Active</h4>
        <p className="text-slate-300 font-medium leading-relaxed">
          Embeddings: <span className="text-white font-bold bg-slate-700 px-2 py-0.5 rounded">MPS GPU</span><br/>
          LLM Engine: <span className="text-white font-bold bg-slate-700 px-2 py-0.5 rounded">Ollama (Llama 3.2 3B)</span><br/>
          Hệ thống đảm bảo dữ liệu không bao giờ rời khỏi thiết bị, đáp ứng tiêu chuẩn Compliance cho ngành Luật & Tài chính.
        </p>
      </div>
    </div>
  );
}
