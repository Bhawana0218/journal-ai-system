"use client";

const AMBIENCE_EMOJI = { forest: "🌲", ocean: "🌊", mountain: "⛰️" };

function StatCard({ icon, label, value, sub, accent }) {
  const accents = {
    green:  "border-green-400 bg-green-50",
    blue:   "border-blue-400 bg-blue-50",
    purple: "border-purple-400 bg-purple-50",
    yellow: "border-yellow-400 bg-yellow-50",
    orange: "border-orange-400 bg-orange-50",
    pink:   "border-pink-400 bg-pink-50",
  };
  return (
    <div className={`rounded-xl border-l-4 p-4 flex items-start gap-3 ${accents[accent] || accents.green}`}>
      <span className="text-2xl mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-base font-bold text-gray-800 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Insights({ insights }) {
  if (!insights) return null;

  const avgS = insights.avgSentiment ?? 0;
  const sentimentLabel =
    avgS >= 0.3 ? "Mostly Positive" : avgS >= -0.3 ? "Balanced" : "Mostly Negative";

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <StatCard icon="📝" label="Total Entries"   value={insights.totalEntries || 0}  accent="green" />
        <StatCard icon="🧠" label="Top Emotion"     value={insights.topEmotion || "N/A"} accent="blue" />
        <StatCard
          icon={AMBIENCE_EMOJI[insights.mostUsedAmbience] || "🌿"}
          label="Fav Ambience"
          value={insights.mostUsedAmbience || "N/A"}
          accent="purple"
        />
        <StatCard
          icon="📊"
          label="Avg Sentiment"
          value={sentimentLabel}
          sub={`Score: ${avgS >= 0 ? "+" : ""}${avgS}`}
          accent="yellow"
        />
        <StatCard
          icon="🔥"
          label="Positive Streak"
          value={insights.moodStreak > 0 ? `${insights.moodStreak} day${insights.moodStreak > 1 ? "s" : ""}` : "—"}
          sub={insights.moodStreak > 0 ? "Keep it going!" : "Start one today"}
          accent="orange"
        />
        <StatCard
          icon="🔑"
          label="Recent Keywords"
          value={insights.recentKeywords?.length > 0 ? insights.recentKeywords.slice(0, 3).join(", ") : "None yet"}
          accent="pink"
        />
      </div>

      {/* AI Mood Summary — from Groq */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-blue-700">🌟 AI Summary — </span>
          {insights.moodSummary || "Write some entries to get your AI summary."}
        </p>
      </div>

      {/* AI Suggestion — from Groq */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-green-700">💡 AI Suggestion — </span>
          {insights.suggestion || "Keep journaling to unlock personalized suggestions."}
        </p>
      </div>
    </div>
  );
}
