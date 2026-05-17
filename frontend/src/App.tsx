import { useState } from 'react';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import ChatBox from './components/ChatBox';
import { Database, MessageSquare, FileText, ShieldCheck } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'docs' | 'dashboard'>('chat');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-green-600" />
            DocManager AI
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 w-max px-2 py-1 rounded-md">Local & Offline</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MessageSquare className="w-5 h-5" /> Chat & Hỏi đáp
          </button>
          <button onClick={() => setActiveTab('docs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText className="w-5 h-5" /> Quản lý tài liệu
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Database className="w-5 h-5" /> Thống kê DB
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatBox />}
        {activeTab === 'docs' && <DocumentList />}
        {activeTab === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}

export default App;
