export default function Insights({ insights }) {
  if (!insights) return null;

  const suggestion = {
    sad: "Try spending time in nature or journaling more frequently.",
    stressed: "Consider meditation or listening to calming music.",
    happy: "Great mood! Keep doing what works for you.",
    calm: "You seem balanced. Maintain your routine."
  };

  return (

    <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 mb-6">
      <h2 className="text-2xl font-extrabold mb-4 text-green-700 text-center drop-shadow-sm">
        🔍 Your Insights
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-green-50 rounded-lg shadow-inner hover:shadow-md transition-shadow duration-300">
          📝 <strong>Total Entries:</strong> {insights.totalEntries || 0}
        </div>

        <div className="p-3 bg-blue-50 rounded-lg shadow-inner hover:shadow-md transition-shadow duration-300">
          🧠 <strong>Top Emotion:</strong> {insights.topEmotion || "N/A"}
        </div>

        <div className="p-3 bg-purple-50 rounded-lg shadow-inner hover:shadow-md transition-shadow duration-300">
          🌊 <strong>Most Used Ambience:</strong> {insights.mostUsedAmbience || "N/A"}
        </div>

        <div className="p-3 bg-yellow-50 rounded-lg shadow-inner hover:shadow-md transition-shadow duration-300">
          🔑 <strong>Recent Keywords:</strong>{" "}
          {insights.recentKeywords?.length > 0
            ? insights.recentKeywords.join(", ")
            : "None"}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-100 rounded-xl shadow-inner hover:shadow-md transition-shadow duration-300">
        <strong>🌟 AI Mood Summary:</strong> {insights.moodSummary || "No summary available."}
      </div>

      <div className="mt-4 p-4 bg-green-100 rounded-xl shadow-inner hover:shadow-md transition-shadow duration-300">
        <strong>💡 AI Suggestion:</strong>{" "}
        {suggestion[insights.topEmotion] || "Keep journaling to understand your mood patterns."}
      </div>
    </div>
  );
}