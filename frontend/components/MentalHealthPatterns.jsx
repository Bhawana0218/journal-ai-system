"use client";

export default function MentalHealthPatterns({ patterns }) {
  if (!patterns) return null;

  return (
    <div className="space-y-3">
      <div className="p-4 bg-green-50 rounded-xl">
        <h3 className="font-semibold text-green-800 mb-2 text-sm">🔄 Recurring Patterns</h3>
        {patterns.patterns?.length > 0 ? (
          <ul className="space-y-1">
            {patterns.patterns.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">•</span>{p}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No recurring patterns detected yet.</p>
        )}
      </div>

      <div className="p-4 bg-red-50 rounded-xl">
        <h3 className="font-semibold text-red-700 mb-2 text-sm">⚠️ Possible Triggers</h3>
        {patterns.triggers?.length > 0 ? (
          <ul className="space-y-1">
            {patterns.triggers.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-400 mt-0.5">•</span>{t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No triggers detected yet.</p>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-xl">
        <h3 className="font-semibold text-blue-700 mb-2 text-sm">💡 Positive Habits</h3>
        {patterns.positiveHabits?.length > 0 ? (
          <ul className="space-y-1">
            {patterns.positiveHabits.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-400 mt-0.5">•</span>{h}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No positive habits found yet.</p>
        )}
      </div>

      {patterns.recommendation && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-emerald-700">✅ Recommendation — </span>
            {patterns.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}