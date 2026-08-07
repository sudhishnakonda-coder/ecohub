import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader2, Bot, User, Leaf, MessageSquare, Trash2 } from 'lucide-react';
import api from '../services/api';

const SUGGESTION_CHIPS = [
  "Best fertilizer for wheat in loamy soil?",
  "How to prevent rice blast disease?",
  "Drip irrigation schedule for tomatoes?",
  "Organic pest control for cotton bollworm?",
  "When to harvest maize for maximum yield?",
  "How to improve soil health naturally?"
];

function formatAIMessage(text) {
  // Convert markdown-like bold **text** to <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert bullet points
  formatted = formatted.replace(/^• /gm, '<span style="color:#34d399;margin-right:6px;">•</span>');
  formatted = formatted.replace(/^- /gm, '<span style="color:#34d399;margin-right:6px;">•</span>');
  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm **Dr. AgroBot** 🌾 — your senior agriculture scientist with 40+ years of experience.\n\nAsk me anything about crops, soil, irrigation, fertilizers, pests, harvest planning, or sustainable farming practices.\n\nI'm here to help you grow better! 🌱",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (messageText) => {
    const text = messageText || inputValue.trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build conversation history (skip welcome message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/advisor/chat', {
        message: text,
        conversationHistory: history
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
        timestamp: res.data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your question. Please try again in a moment. 🙏",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm **Dr. AgroBot** 🌾 — your senior agriculture scientist with 40+ years of experience.\n\nAsk me anything about crops, soil, irrigation, fertilizers, pests, harvest planning, or sustainable farming practices.\n\nI'm here to help you grow better! 🌱",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
            <span>AI Agronomist Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">AI Crop Advisor</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Chat with Dr. AgroBot — your senior agriculture scientist powered by Gemini AI
          </p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-semibold transition-all"
          title="Clear chat"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col glass-panel rounded-3xl border border-emerald-900/30 overflow-hidden min-h-0">
        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#065f46 transparent' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${msg.role === 'user'
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : 'bg-amber-500/10 border border-amber-500/30'
                  }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Leaf className="h-4 w-4 text-amber-400" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] lg:max-w-[70%] ${msg.role === 'user'
                    ? 'bg-emerald-600/20 border border-emerald-500/30 rounded-2xl rounded-tr-md'
                    : msg.isError
                      ? 'bg-red-950/40 border border-red-500/30 rounded-2xl rounded-tl-md'
                      : 'bg-slate-900/80 border border-slate-700/50 rounded-2xl rounded-tl-md'
                  } px-4 py-3`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center space-x-1.5 mb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Dr. AgroBot</span>
                  </div>
                )}
                <div
                  className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-emerald-50' : 'text-slate-200'
                    }`}
                  dangerouslySetInnerHTML={{ __html: formatAIMessage(msg.content) }}
                />
                <div className={`mt-1.5 text-[10px] ${msg.role === 'user' ? 'text-emerald-400/60 text-right' : 'text-slate-500'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/30">
                <Leaf className="h-4 w-4 text-amber-400" />
              </div>
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Dr. AgroBot</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-slate-400 ml-1">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips (show only when few messages) */}
        {messages.length <= 1 && (
          <div className="px-4 lg:px-6 pb-2 shrink-0">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Quick Questions</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip)}
                  disabled={isTyping}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-emerald-900/40 text-[11px] font-semibold text-emerald-300 transition-all hover:border-emerald-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 lg:p-4 border-t border-emerald-900/30 bg-slate-950/50 shrink-0">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Dr. AgroBot about crops, soil, pests, irrigation..."
                rows={1}
                className="w-full px-4 py-3 bg-slate-900/90 border border-emerald-800/40 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                style={{ minHeight: '46px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = '46px';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                disabled={isTyping}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="shrink-0 h-[46px] w-[46px] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950 transform hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <span className="text-[10px] text-slate-600 flex items-center space-x-1">
              <Bot className="h-3 w-3" />
              <span>Powered by Gemini AI • Responses are AI-generated advice</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
