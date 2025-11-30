"use client";

import { useState } from "react";
import {
  CategoryTabs,
  MockContentsGrid,
  ContentsInfiniteScroll,
  MediaType,
} from "@/components/features/contents";

export default function MainPage() {
  const [mediaType, setMediaType] = useState<MediaType>("all");

  // Use theme context for dynamic styling
  return (
    <div className="min-h-screen">
      <div className="flex-1 space-y-6">
        {/* Category Tabs */}
        <CategoryTabs mediaType={mediaType} onMediaTypeChange={setMediaType} />
        {/* Content */}
        {/* <MockContentsGrid /> */}
        <ContentsInfiniteScroll mediaType={mediaType} />
      </div>
    </div>
  );
}
