import React, { useState, useRef, useEffect } from 'react';
import { queryDocument } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Hệ thống AI nội bộ đã sẵn sàng. Bạn muốn tìm kiếm hoặc hỏi gì trong các tài liệu đã tải lên?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((p: Message[]) => [...p, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await queryDocument(userMsg);
      setMessages((p: Message[]) => [...p, { role: 'assistant', content: res.answer, sources: res.sources }]);
    } catch (err) {
      setMessages((p: Message[]) => [...p, { role: 'assistant', content: '⚠️ Mất kết nối tới Backend AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">📄 Nguồn trích dẫn</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, idx) => (
                      <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium border border-indigo-100">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-sm font-medium text-gray-500">Llama 3.2 đang suy luận và phân tích tài liệu...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="relative max-w-4xl mx-auto shadow-lg rounded-2xl border border-gray-200 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi AI về hợp đồng, báo cáo, quy định..."
            className="w-full pl-6 pr-14 py-4 rounded-2xl focus:outline-none text-gray-700 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
