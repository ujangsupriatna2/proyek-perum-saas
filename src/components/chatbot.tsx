"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquare, Trash2, Bot, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/settings-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "Rumah termurah berapa?",
  "Cicilan Type 45 berapa?",
  "Lokasi di mana?",
  "Apa keunggulannya?",
];

export default function Chatbot() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef(
    `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { settings: S } = useSettingsStore();

  // Close menu when chat opens or vice versa
  const openChat = () => {
    setMenuOpen(false);
    setChatOpen(true);
  };

  const openWhatsApp = () => {
    setMenuOpen(false);
    const text = encodeURIComponent(`Halo, saya tertarik dengan properti ${S.company_name}.`);
    window.open(`https://wa.me/${S.contact_wa}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = () => setMenuOpen(false);
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            `Halo! 👋 Saya AI Assistant ${S.company_name}.\n\nSaya bisa membantu Anda informasi seputar:\n• 🏠 Daftar properti & harga\n• 💰 Simulasi cicilan\n• 📍 Lokasi & fasilitas\n• 📋 Skema pembayaran\n\nSilakan tanyakan apa saja!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [chatOpen, messages.length]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            sessionId: sessionIdRef.current,
          }),
        });

        const data = await res.json();

        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: data.response || `Maaf, saya tidak bisa menjawab saat ini. Silakan hubungi ${S.contact_phone}.`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        const errMsg: Message = {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            `Maaf, terjadi kesalahan koneksi. Silakan coba lagi atau hubungi kami langsung:\n\n📱 WhatsApp: ${S.contact_phone}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i) => {
      let formatted = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>'
      );
      if (formatted.startsWith("### ")) {
        return (
          <p
            key={i}
            className="font-bold text-gray-900 text-sm mt-2 mb-1"
            dangerouslySetInnerHTML={{
              __html: formatted.replace("### ", ""),
            }}
          />
        );
      }
      if (formatted.startsWith("## ")) {
        return (
          <p
            key={i}
            className="font-bold text-gray-900 mt-2 mb-1"
            dangerouslySetInnerHTML={{
              __html: formatted.replace("## ", ""),
            }}
          />
        );
      }
      if (formatted.startsWith("• ") || formatted.startsWith("- ")) {
        const text = formatted.replace(/^[•-]\s*/, "");
        return (
          <li
            key={i}
            className="ml-3 list-disc"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }
      if (formatted.startsWith("|")) {
        return null;
      }
      if (formatted.trim() === "") {
        return <div key={i} className="h-1.5" />;
      }
      return (
        <p
          key={i}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <>
      {/* Main FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={(e) => {
          e.stopPropagation();
          if (chatOpen) {
            setChatOpen(false);
          } else {
            setMenuOpen((prev) => !prev);
          }
        }}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 ${
          chatOpen
            ? "bg-gray-700 shadow-gray-300/50"
            : "bg-gradient-to-br from-gray-800 to-gray-950 shadow-gray-900/50 hover:from-gray-900 hover:to-black"
        }`}
        aria-label="Menu Kontak"
      >
        {chatOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageSquare className="w-7 h-7" />
        )}
        {!chatOpen && (
          <span className="absolute inset-0 rounded-full bg-gray-900 animate-ping opacity-20" />
        )}
      </motion.button>

      {/* Popup Menu (2 options) */}
      <AnimatePresence>
        {menuOpen && !chatOpen && (
          <>
            {/* Backdrop to close menu on outside click */}
            <div className="fixed inset-0 z-40" />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-24 right-6 z-50 flex flex-col gap-3 items-end"
            >
              {/* Tooltip label */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg mr-2 shadow-lg"
              >
                Ada yang bisa kami bantu?
              </motion.div>

              {/* WhatsApp Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                onClick={openWhatsApp}
                className="flex items-center gap-3 bg-white border border-green-200 rounded-2xl px-4 py-3 shadow-xl hover:shadow-2xl hover:bg-green-50 transition-all active:scale-95 group w-auto"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">WhatsApp</p>
                </div>
              </motion.button>

              {/* Chatbot Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={openChat}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all active:scale-95 group w-auto"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-gray-800 to-gray-950 rounded-xl flex items-center justify-center shadow-md shadow-gray-300 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">AI Chatbot</p>
                </div>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-w-[calc(100vw-3rem)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-950 text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">AI Assistant</p>
                  <p className="text-[11px] text-gray-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Bersihkan chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setChatOpen(false)}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[450px] bg-gray-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-gray-700" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-gray-800 to-gray-950 text-white rounded-br-md"
                        : "bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <div className={msg.role === "user" ? "" : "text-gray-600"}>
                      {formatMessage(msg.content)}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 py-2 bg-white border-t border-gray-100 flex-shrink-0">
                <p className="text-[11px] text-gray-400 mb-2 font-medium">
                  Pertanyaan cepat:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors font-medium border border-gray-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pertanyaan Anda..."
                  disabled={isLoading}
                  className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all disabled:opacity-50 placeholder:text-gray-400"
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="h-11 w-11 bg-gradient-to-r from-gray-800 to-gray-950 hover:from-gray-900 hover:to-black text-white rounded-xl p-0 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-gray-300 mt-1.5 text-center">
                Powered by AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
