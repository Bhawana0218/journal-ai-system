export default function EntryList({ entries }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700 text-center drop-shadow-sm">
        📝 Previous Entries
      </h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry._id}
            className="p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 border-green-400 cursor-pointer hover:scale-105 transform"
          >
            <p className="text-sm text-gray-500 mb-2">
              <strong>Ambience:</strong> {entry.ambience}
            </p>
            <p className="text-gray-800">{entry.text}</p>
            <p className="text-xs text-gray-400 mt-2 text-right">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}