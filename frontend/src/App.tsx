import { useState } from 'react';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import ChatBox from './components/ChatBox';
import { Database, FileText, MessageSquare, ShieldCheck } from 'lucide-react';

type Tab = 'chat' | 'docs' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [datasetVersion, setDatasetVersion] = useState(0);

  const refreshDataset = () => setDatasetVersion((value) => value + 1);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="z-10 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <ShieldCheck className="h-7 w-7 text-green-600" />
            DocManager AI
          </h1>
          <p className="mt-1 w-max rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">Local Dataset</p>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <button onClick={() => setActiveTab('chat')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${activeTab === 'chat' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MessageSquare className="h-5 w-5" /> Chat & Hoi dap
          </button>
          <button onClick={() => setActiveTab('docs')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${activeTab === 'docs' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText className="h-5 w-5" /> Bo du lieu
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Database className="h-5 w-5" /> Thong ke DB
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatBox />}
        {activeTab === 'docs' && <DocumentList datasetVersion={datasetVersion} onDatasetChanged={refreshDataset} />}
        {activeTab === 'dashboard' && <Dashboard refreshKey={datasetVersion} />}
      </div>
    </div>
  );
}

export default App;
