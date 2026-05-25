"use client";

import React from "react";
import { TagCloud } from "react-tagcloud";

export default function KeywordCloud({ keywords = [] }) {
  const tags = keywords.map((k) => ({ value: k, count: 1 }));

  if (!tags.length)
    return <p className="text-sm text-gray-400 text-center py-6">No keywords yet</p>;

  return (
    <div className="flex justify-center items-center min-h-[120px]">
      <TagCloud
        minSize={16}
        maxSize={36}
        tags={tags}
        className="flex flex-wrap justify-center gap-3 cursor-pointer"
        shuffle={true}
      />
    </div>
  );
}
