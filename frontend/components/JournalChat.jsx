"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

// ── Phase config — driven by AI-detected phase in each response ───────────────
const PHASE = {
  reflect: { label: "Reflection",          icon: "🌱", orb: "from-violet-400 via-purple-500 to-indigo-500", glow: "shadow-purple-200", badge: "bg-purple-100 text-purple-700" },
  breathe: { label: "Breathing Exercise",  icon: "🌱", orb: "from-cyan-400 via-teal-400 to-emerald-400",   glow: "shadow-teal-200",   badge: "bg-teal-100 text-teal-700"   },
  mindful: { label: "Mindfulness",         icon: "🌱", orb: "from-amber-400 via-orange-400 to-yellow-400", glow: "shadow-amber-200",  badge: "bg-amber-100 text-amber-700" },
  habit:   { label: "Healthy Habits",      icon: "🌱", orb: "from-green-400 via-emerald-500 to-teal-500",  glow: "shadow-green-200",  badge: "bg-green-100 text-green-700" },
  refer:   { label: "Professional Support",icon: "🤝", orb: "from-rose-400 via-pink-400 to-red-400",       glow: "shadow-rose-200",   badge: "bg-rose-100 text-rose-700"   },
};

const QUICK_ACTIONS = [
  { label: "How have I been feeling lately?",    icon: "🌱" },
  { label: "Guide me through a breathing exercise", icon: "🌬️" },
  { label: "I'm feeling overwhelmed right now",  icon: "😰" },
  { label: "Give me a 2-minute mindfulness exercise", icon: "🌱" },
  { label: "What healthy habits should I build?", icon: "🌱" },
  { label: "What patterns do you see in my journal?", icon: "🔍" },
  { label: "I need some encouragement",          icon: "💪" },
  { label: "Recommend a daily wellness routine", icon: "📋" },
];

// ── Breathing orb ─────────────────────────────────────────────────────────────
function Orb({ phase, thinking }) {
  const cfg = PHASE[phase] || PHASE.reflect;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${cfg.orb}
          shadow-lg ${cfg.glow}
          ${thinking ? "animate-spin-slow" : phase === "breathe" ? "animate-breathe" : "animate-pulse-slow"}
          transition-all duration-700`}
      >
        <div className="absolute inset-1.5 rounded-full bg-white/20 backdrop-blur-sm" />
      </div>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
        {thinking ? "Thinking…" : cfg.label}
      </span>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const cfg = PHASE[msg.phase];
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}>
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
        ${isUser
          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
          : "bg-gradient-to-br from-teal-400 to-emerald-500 text-white"}`}>
        {isUser ? "You" : "🌿"}
      </div>

      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {/* Phase badge on AI messages */}
        {!isUser && cfg && cfg.label !== "Reflection" && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
          ${isUser
            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"}`}>
          {msg.text}
        </div>
        <span className="text-xs text-gray-400 px-1">
          {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JournalChat() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);   // Groq conversation context
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("reflect");
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Open with a personalised AI greeting on mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    setLoading(true);

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/journal/chat/123`, {
      question: "__OPEN__",   // special token — therapist service handles empty opener
      history: []
    })
      .then(res => {
        const { answer, phase: p } = res.data;
        setPhase(p || "reflect");
        setMessages([{ role: "ai", text: answer, phase: p, ts: Date.now() }]);
        setHistory([{ role: "assistant", content: answer }]);
      })
      .catch(() => {
        const fallback = "Hi! I'm your AI wellness companion. I've read your journal entries and I'm here to help — ask me anything, or try one of the suggestions below. 💬";
        setMessages([{ role: "ai", text: fallback, phase: "reflect", ts: Date.now() }]);
        setHistory([{ role: "assistant", content: fallback }]);
      })
      .finally(() => setLoading(false));
  }, [initialized]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", text: msg, ts: Date.now() };
    const newHistory = [...history, { role: "user", content: msg }];

    setMessages(prev => [...prev, userMsg]);
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/chat/123`,
        { question: msg, history: newHistory }
      );
      const { answer, phase: p } = res.data;
      setPhase(p || "reflect");
      setMessages(prev => [...prev, { role: "ai", text: answer, phase: p, ts: Date.now() }]);
      setHistory(prev => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "I lost connection for a moment. Take a breath — I'm still here.",
        phase: "breathe",
        ts: Date.now()
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const showQuickActions = messages.length <= 1 && !loading;

  return (
    <div className="flex flex-col h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-white border border-gray-100 shadow-sm">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">🌿</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">AI Wellness Companion</p>
            <p className="text-purple-200 text-xs">Journal insights · Breathing · Mindfulness · Habits</p>
          </div>
        </div>
        {/* Disclaimer pill */}
        <span className="hidden sm:block text-xs bg-white/15 text-white/80 border border-white/20 px-2.5 py-1 rounded-full">
          ⚠️ Not medical advice
        </span>
      </div>

      {/* ── Orb + phase ─────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-4 pb-2 bg-gradient-to-b from-violet-50/40 to-transparent shrink-0">
        <Orb phase={phase} thinking={loading} />
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
        {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

        {loading && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xs shrink-0">🌿</div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center shadow-sm">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      {showQuickActions && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={() => send(a.label)}
              className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors font-medium"
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 bg-white shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && send()}
          placeholder="Ask anything — journal insights, breathing, habits…"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50 bg-gray-50"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
