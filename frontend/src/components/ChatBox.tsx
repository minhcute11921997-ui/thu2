import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Loader2,
  MessageSquarePlus,
  MessagesSquare,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { getErrorMessage, queryDocument } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'mis.chat.conversations.v1';
const HISTORY_MESSAGE_LIMIT = 16;
const HISTORY_CHAR_LIMIT = 6000;
const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    'Xin chao. Hay dat cau hoi hoac mo ta tinh huong can phan tich. Moi cuoc tro chuyen se giu ngu canh rieng.',
};

const createConversation = (): Conversation => ({
  id: crypto.randomUUID(),
  title: 'Cuoc tro chuyen moi',
  messages: [WELCOME_MESSAGE],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const buildConversationContext = (messages: Message[]) => {
  const historyLines = messages
    .filter((message) => message.role !== 'assistant' || message.content !== WELCOME_MESSAGE.content)
    .slice(-HISTORY_MESSAGE_LIMIT)
    .map((message, index) => {
      const role = message.role === 'user' ? 'Nguoi dung' : 'Tro ly';
      const content = message.content.replace(/\s+/g, ' ').trim();
      return `Luot ${index + 1} - ${role}: ${content}`;
    });

  const history = historyLines.join('\n\n');
  return history.length > HISTORY_CHAR_LIMIT ? history.slice(-HISTORY_CHAR_LIMIT) : history;
};

export default function ChatBox() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [createConversation()];

    try {
      const parsed = JSON.parse(saved) as Conversation[];
      return parsed.length > 0 ? parsed : [createConversation()];
    } catch {
      return [createConversation()];
    }
  });
  const [activeConversationId, setActiveConversationId] = useState(() => conversations[0].id);
  const [input, setInput] = useState('');
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );
  const loading = loadingConversationId === activeConversation.id;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation.messages, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  const updateConversation = (conversationId: string, updater: (conversation: Conversation) => Conversation) => {
    setConversations((prev) =>
      prev.map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation)),
    );
  };

  const handleNewConversation = () => {
    const conversation = createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    setInput('');
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const next = prev.filter((conversation) => conversation.id !== conversationId);
      const safeNext = next.length > 0 ? next : [createConversation()];
      if (conversationId === activeConversationId) {
        setActiveConversationId(safeNext[0].id);
      }
      return safeNext;
    });
  };

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || loadingConversationId) return;

    const conversationId = activeConversation.id;
    const currentMessages = activeConversation.messages;
    const conversationContext = buildConversationContext(currentMessages);

    setInput('');
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title: conversation.title === 'Cuoc tro chuyen moi' ? userMessage.slice(0, 48) : conversation.title,
      messages: [...conversation.messages, { role: 'user', content: userMessage }],
      updatedAt: Date.now(),
    }));
    setLoadingConversationId(conversationId);

    try {
      const res = await queryDocument(userMessage, conversationContext);
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, { role: 'assistant', content: res.answer, sources: res.sources }],
        updatedAt: Date.now(),
      }));
    } catch (err) {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [
          ...conversation.messages,
          { role: 'assistant', content: getErrorMessage(err, 'Mat ket noi toi Backend AI.') },
        ],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoadingConversationId(null);
    }
  };

  return (
    <div className="flex h-full bg-white">
      <aside className="flex w-72 flex-col border-r border-gray-200 bg-slate-50">
        <div className="border-b border-gray-200 p-4">
          <button
            onClick={handleNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Cuoc tro chuyen moi
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {conversations.map((conversation) => {
            const active = conversation.id === activeConversation.id;
            return (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  active ? 'border-indigo-200 bg-white shadow-sm' : 'border-transparent hover:bg-white'
                }`}
              >
                <button
                  onClick={() => setActiveConversationId(conversation.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <MessagesSquare className={`h-4 w-4 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className={`truncate text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-600'}`}>
                    {conversation.title}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteConversation(conversation.id)}
                  className="rounded-md p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  aria-label="Xoa cuoc tro chuyen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="border-b border-gray-100 px-8 py-4">
          <h2 className="truncate text-lg font-bold text-slate-900">{activeConversation.title}</h2>
          <p className="text-xs font-medium text-slate-500">
            Ngu canh chi duoc lay trong cuoc tro chuyen nay va dataset local.
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-8 pb-36">
          {activeConversation.messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 shadow-sm">
                  <Bot className="h-6 w-6 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl p-5 shadow-sm ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Nguon trich dan</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source) => (
                        <span
                          key={source}
                          className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 shadow-sm">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 shadow-sm">
                <Sparkles className="h-5 w-5 animate-pulse text-indigo-600" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span className="text-sm font-medium text-gray-500">Dang phan tich theo ngu canh cuoc tro chuyen...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent p-6">
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Nhap cau hoi hoac tinh huong... Enter de gui, Shift+Enter de xuong dong"
              className="max-h-40 min-h-[56px] w-full resize-none rounded-2xl py-4 pl-6 pr-14 font-medium text-gray-700 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={Boolean(loadingConversationId) || !input.trim()}
              className="absolute bottom-3 right-3 rounded-xl bg-indigo-600 p-2.5 text-white shadow-md transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
