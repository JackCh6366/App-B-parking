import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, Trash2, RefreshCw, ChevronRight, HelpCircle, AlertCircle, Cpu } from 'lucide-react';
import { ParkingSpot, AiProvider } from '../types/parking';
import { AI_PROVIDERS } from '../config/aiProviders.config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiCustomerServiceModalProps {
  currentCityName: string;
  district: string;
  searchQuery: string;
  filteredSpotsCount: number;
  selectedSpot: ParkingSpot | null;
}

const QUICK_QUESTIONS = [
  '孕婦親子格沒識別證會被開罰嗎？',
  '身障車格有哪些收費優惠規定？',
  '路邊停車幾點開始收費？去哪裡繳費？',
  '地圖上的「停車壓力熱力圖」怎麼看？',
  '電動車充電車位燃油車可以停嗎？'
];

export const AiCustomerServiceModal: React.FC<AiCustomerServiceModalProps> = ({
  currentCityName,
  district,
  searchQuery,
  filteredSpotsCount,
  selectedSpot,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('gemini');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `您好！我是 **Jack的停車位小幫手 AI 客服** 🤖\n\n我可以為您解答全台與大台北、大台中地區的：\n• **特殊車位規定**（孕婦格、身障格、充電格、裝卸貨格）\n• **違規罰則與舉報管道**\n• **收費時段與超商/行動支付繳費方法**\n• **停車壓力熱力圖** 與尋找車位的實用技巧\n\n您可隨時切換上方 AI 引擎選單（支援 Gemini, Nemotron, Gemma 4, GPT-OSS 等 7 款模型）。`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動滾動到最下方
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const currentProviderInfo = AI_PROVIDERS.find(p => p.id === selectedProvider) || AI_PROVIDERS[0];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // 轉換歷史訊息格式送至 /api/analyze
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          messages: apiMessages,
          context: {
            cityName: currentCityName,
            district: district === 'all' ? '全轄區' : district,
            searchQuery: searchQuery || '無',
            filteredSpotCount: filteredSpotsCount,
            selectedSpotName: selectedSpot ? `${selectedSpot.roadName} (${selectedSpot.addressDesc})` : '未選取',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `呼叫 ${currentProviderInfo.name} 失敗 (${response.status})`);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || '抱歉，暫時無法回應。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to get AI reply:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **AI 引擎回應失敗 (${currentProviderInfo.name})**\n\n${err?.message || '網路連線或系統服務繁忙，請手動切換其他 AI 引擎或稍後再試。'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: '對話記錄已重置！請問有什麼停車相關問題需要協助嗎？',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // 格式化輸出內文 (支援粗體與分段)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className={`${line.trim() === '' ? 'h-2' : 'my-0.5'} leading-relaxed`}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* 右下角浮動按鈕 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
          </span>
          <Bot className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm tracking-wide">AI 停車客服</span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        </button>
      </div>

      {/* 展開式對話視窗 Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full sm:max-w-md h-[90vh] sm:h-[650px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header 頂部欄 */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex flex-col gap-2.5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative p-2 rounded-2xl bg-indigo-600/30 border border-indigo-400/30">
                    <Bot className="w-5 h-5 text-cyan-300" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      Jack的停車位小幫手 AI 客服
                    </h3>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1">
                      📍 城市: <span className="text-amber-300 font-medium">{currentCityName}</span> | 區: {district === 'all' ? '全區' : district}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearHistory}
                    title="重置對話記錄"
                    className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* AI 引擎切換下拉選單 (7 引擎) */}
              <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium shrink-0">AI 引擎:</span>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as AiProvider)}
                  className="flex-1 bg-slate-900 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {AI_PROVIDERS.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} ({provider.vendor})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 即時 Context 提示條 */}
            <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 text-[11px] text-indigo-900 flex items-center justify-between">
              <span className="truncate">
                💡 即時地圖：<strong className="text-indigo-700">{filteredSpotsCount}</strong> 個空車位
                {selectedSpot && ` | 已選格: ${selectedSpot.roadName}`}
              </span>
              <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                {currentProviderInfo.name} 在線
              </span>
            </div>

            {/* 訊息聊天區 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-xs border border-indigo-200">
                      <Bot className="w-4 h-4 text-cyan-200" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs transition-all ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      renderFormattedContent(msg.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <span
                      className={`block text-[9px] mt-1 text-right font-mono ${
                        msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* 載入中 Prompt */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4 text-cyan-200 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none px-4 py-3 text-xs shadow-xs flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                    <span className="text-slate-600 font-medium">
                      [{currentProviderInfo.name}] 分析與回答中...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions 快捷問答 */}
            <div className="bg-white border-t border-slate-100 p-2.5 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 shrink-0 px-1">
                <HelpCircle className="w-3 h-3 text-indigo-500" /> 常見快問:
              </span>
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200/80 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* 輸入框 Input Box */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="詢問停車規範、收費、特殊車格..."
                disabled={isLoading}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
