"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import JournalForm from "@/components/JournalForm";
import EntryList from "@/components/EntryList";
import Insights from "@/components/Insights";
import EmotionChart from "@/components/EmotionChart";
import EmotionPieChart from "@/components/EmotionPieChart";
import KeywordCloud from "@/components/KeywordCloud";
import MentalHealthPatterns from "@/components/MentalHealthPatterns";
import JournalChat from "@/components/JournalChat";

const TABS = [
  { id: "home",      label: "Overview",  icon: "🏠" },
  { id: "write",     label: "Write",     icon: "✍️"  },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "chat",      label: "AI Chat",   icon: "🤖" },
];

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("home");
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const [entriesRes, insightsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/journal/123"),
        axios.get("http://localhost:5000/api/journal/insights/123"),
      ]);
      setEntries(entriesRes.data);
      setInsights(insightsRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const handleNewEntry = (entry) => {
    setEntries(prev => [entry, ...prev]);
    // Refresh insights after new entry (AI re-analysis)
    axios.get("http://localhost:5000/api/journal/insights/123")
      .then(r => setInsights(r.data))
      .catch(() => {});
  };

  // ─── Greeting ───────────────────────────────────────────────────────────────
  const topEmotion = insights?.topEmotion || null;
  const avgS = insights?.avgSentiment ?? null;
  const moodColor =
    avgS === null ? "from-green-400 to-emerald-500"
    : avgS >= 0.3  ? "from-green-400 to-emerald-500"
    : avgS >= -0.3 ? "from-yellow-400 to-amber-500"
    :                "from-rose-400 to-pink-500";

  // ─── Tab pages ──────────────────────────────────────────────────────────────

  const PageHome = (
    <div className="page-enter space-y-5">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${moodColor} p-6 text-white shadow-lg`}>
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">{greeting} 👋</p>
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
              {loading ? "Loading your journal…" : (
                topEmotion
                  ? <>You've been feeling <span className="underline decoration-white/50 decoration-2">{topEmotion}</span> lately</>
                  : "Start your journey today"
              )}
            </h2>
            {insights?.moodSummary && (
              <p className="mt-2 text-white/85 text-sm leading-relaxed max-w-lg">
                {insights.moodSummary}
              </p>
            )}
          </div>

          {/* Quick action */}
          <button
            onClick={() => setTab("write")}
            className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
          >
            ✍️ Write today's entry
          </button>
        </div>

        {/* Stat pills */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-5">
          {[
            { label: "Entries",  value: insights?.totalEntries ?? "—" },
            { label: "Streak",   value: insights?.moodStreak > 0 ? `${insights.moodStreak} day${insights.moodStreak > 1 ? "s" : ""}` : "—" },
            { label: "Sentiment", value: avgS !== null ? (avgS >= 0 ? `+${avgS}` : `${avgS}`) : "—" },
            { label: "Ambience", value: insights?.mostUsedAmbience ?? "—" },
          ].map(s => (
            <div key={s.label} className="bg-white/20 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p className="text-lg font-extrabold leading-none">{loading ? "…" : s.value}</p>
              <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column middle row ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* AI Insights stats + summary */}
        <Section title="🔍 AI Insights" sub="Powered by Groq · updates after each entry">
          {loading
            ? <p className="text-sm text-gray-400 animate-pulse">Analyzing your journal…</p>
            : <Insights insights={insights} />
          }
        </Section>

        {/* Mini mood chart */}
        <Section title="📈 Mood Timeline" sub="Real sentiment scores from AI">
          <EmotionChart insights={insights || {}} />
        </Section>
      </div>

      {/* ── AI Suggestion banner ─────────────────────────────────────────── */}
      {insights?.suggestion && (
        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl shadow-sm">
          <span className="text-3xl shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">AI Suggestion</p>
            <p className="text-gray-700 text-sm leading-relaxed">{insights.suggestion}</p>
          </div>
        </div>
      )}

      {/* ── Recent entries ───────────────────────────────────────────────── */}
      <Section title="📝 Recent Entries" sub="Your last 3 journal entries">
        {loading
          ? <p className="text-sm text-gray-400 animate-pulse">Loading entries…</p>
          : <EntryList entries={entries.slice(0, 3)} />
        }
        {!loading && entries.length > 3 && (
          <button
            onClick={() => setTab("write")}
            className="mt-4 text-sm text-green-600 font-semibold hover:text-green-700 flex items-center gap-1"
          >
            View all {entries.length} entries →
          </button>
        )}
        {!loading && entries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📓</p>
            <p className="text-gray-500 text-sm mb-4">No entries yet. Start writing to see your insights.</p>
            <button
              onClick={() => setTab("write")}
              className="bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-green-600 transition-colors"
            >
              Write your first entry →
            </button>
          </div>
        )}
      </Section>
    </div>
  );

  const PageWrite = (
    <div className="page-enter space-y-5">
      <Section title="✍️ New Entry" sub="Write freely — AI will analyze your mood automatically">
        <JournalForm onNewEntry={handleNewEntry} />
      </Section>

      <Section title="📝 All Entries" sub={`${entries.length} total entries`}>
        {loading
          ? <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
          : <EntryList entries={entries} />
        }
      </Section>
    </div>
  );

  const PageAnalytics = (
    <div className="page-enter space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Section title="📈 Mood Timeline" sub="Real sentiment scores from AI">
          <EmotionChart insights={insights || {}} />
        </Section>

        <Section title="🥧 Emotion Breakdown" sub="AI-detected emotions across all entries">
          <EmotionPieChart insights={insights || {}} />
        </Section>

        <Section title="🔑 Keyword Cloud" sub="Most frequent themes in your journal">
          <KeywordCloud keywords={insights?.recentKeywords || []} />
        </Section>

        <Section title="🧠 Mental Health Patterns" sub="AI pattern analysis">
          <MentalHealthPatterns patterns={insights?.patterns || []} />
        </Section>
      </div>
    </div>
  );

  const PageChat = (
    <div className="page-enter">
      <Section title="🤖 AI Wellness Companion" sub="Journal insights · Breathing · Mindfulness · Healthy habits · Not medical advice">
        <JournalChat />
      </Section>
    </div>
  );

  const pages = { home: PageHome, write: PageWrite, analytics: PageAnalytics, chat: PageChat };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">

      {/* ── Top nav bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="text-base font-extrabold text-gray-800 leading-tight">NatureMind</h1>
              <p className="text-xs text-gray-400 leading-tight">AI Journal</p>
            </div>
          </div>

          {/* Tab bar */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t.id
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {pages[tab]}
      </main>

      {/* ── Bottom tab bar (mobile) ──────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition-colors ${
                tab === t.id ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span className="text-lg mb-0.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
