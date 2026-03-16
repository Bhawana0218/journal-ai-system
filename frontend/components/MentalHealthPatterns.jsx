"use client";

export default function MentalHealthPatterns({ patterns }) {

  if (!patterns) return null;

  return (
   
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 mb-6">
      <h2 className="text-2xl font-extrabold mb-6 text-green-700 text-center drop-shadow-sm">
        🧠 AI Mental Health Patterns
      </h2>

      {/* Recurring Patterns */}
      <div className="mb-4 p-4 bg-green-50 rounded-xl shadow-inner hover:shadow-md transition-shadow duration-300">
        <h3 className="font-semibold text-green-800 mb-2">🔄 Recurring Patterns</h3>
        {patterns.patterns?.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-800">
            {patterns.patterns.map((p, i) => (
              <li key={i} className="hover:text-green-600 transition-colors duration-200 cursor-pointer">
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recurring patterns detected.</p>
        )}
      </div>

      {/* Possible Triggers */}
      <div className="mb-4 p-4 bg-red-50 rounded-xl shadow-inner hover:shadow-md transition-shadow duration-300">
        <h3 className="font-semibold text-red-700 mb-2">⚠️ Possible Triggers</h3>
        {patterns.triggers?.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-800">
            {patterns.triggers.map((t, i) => (
              <li key={i} className="hover:text-red-600 transition-colors duration-200 cursor-pointer">
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No triggers detected.</p>
        )}
      </div>

      {/* Positive Habits */}
      <div className="mb-4 p-4 bg-blue-50 rounded-xl shadow-inner hover:shadow-md transition-shadow duration-300">
        <h3 className="font-semibold text-blue-700 mb-2">💡 Positive Habits</h3>
        {patterns.positiveHabits?.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-800">
            {patterns.positiveHabits.map((h, i) => (
              <li key={i} className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                {h}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No positive habits found.</p>
        )}
      </div>

      {/* Recommendation */}
      <div className="mt-4 p-4 bg-green-100 rounded-2xl shadow-inner hover:shadow-md transition-shadow duration-300">
        <strong className="text-green-800">✅ Recommendation:</strong>{" "}
        <span className="text-gray-800">{patterns.recommendation || "No recommendation available."}</span>
      </div>
    </div>
  );
}