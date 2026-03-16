"use client";

import React from "react";
import { TagCloud } from "react-tagcloud";

export default function KeywordCloud({ keywords = [] }) {
  const tags = keywords.map((k) => ({
    value: k,
    count: 1,
  }));

  return (

    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 mb-6">
      <h2 className="text-2xl font-extrabold mb-4 text-gradient bg-clip-text text-transparent from-green-400 to-blue-500 bg-linear-to-r">
        🔑 Keyword Cloud
      </h2>

      {tags.length > 0 ? (
        <div className="flex justify-center items-center">
          <TagCloud
            minSize={20}
            maxSize={40}
            tags={tags}
            className="flex flex-wrap justify-center gap-3 cursor-pointer"
            shuffle={true}
          />
        </div>
      ) : (
        <p className="text-gray-500 text-center">No keywords yet</p>
      )}
    </div>
  );
}