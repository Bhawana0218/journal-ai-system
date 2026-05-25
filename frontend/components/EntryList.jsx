"use client";

const AMBIENCE_EMOJI = { forest: "🌲", ocean: "🌊", mountain: "⛰️" };

const EMOTION_STYLE = {
  happy:    "bg-yellow-100 text-yellow-700 border-yellow-300",
  excited:  "bg-orange-100 text-orange-700 border-orange-300",
  calm:     "bg-blue-100 text-blue-700 border-blue-300",
  sad:      "bg-indigo-100 text-indigo-700 border-indigo-300",
  stressed: "bg-red-100 text-red-700 border-red-300",
  anxious:  "bg-red-100 text-red-700 border-red-300",
  neutral:  "bg-gray-100 text-gray-500 border-gray-200",
  grateful: "bg-green-100 text-green-700 border-green-300",
  hopeful:  "bg-teal-100 text-teal-700 border-teal-300",
};

export default function EntryList({ entries }) {
  if (!entries?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📓</p>
        <p className="text-sm">No entries yet — write your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const emotion = (entry.emotion || "neutral").toLowerCase();
        const emotionStyle = EMOTION_STYLE[emotion] || EMOTION_STYLE.neutral;

        return (
          <div
            key={entry._id}
            className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-green-400"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${emotionStyle}`}>
                {entry.emotion || "neutral"}
              </span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{AMBIENCE_EMOJI[entry.ambience]} {entry.ambience}</span>
                <span>{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            {/* Entry text */}
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{entry.text}</p>

            {/* Keywords */}
            {entry.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {entry.keywords.map(kw => (
                  <span key={kw} className="text-xs bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
