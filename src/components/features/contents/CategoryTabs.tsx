// src/components/features/contents/CategoryTabs.tsx
"use client";

import React from "react";
import { SlidersHorizontal, PlayCircle, Music2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

export type MediaType = "all" | "video" | "audio";

interface CategoryTabsProps {
  mediaType: MediaType;                        // 👈 รับค่าจาก parent
  onMediaTypeChange?: (type: MediaType) => void;
}

export default function CategoryTabs({
  mediaType,
  onMediaTypeChange,
}: CategoryTabsProps) {
  const handleMediaTypeChange = (value: MediaType) => {
    console.log("[CategoryTabs] change to:", value);
    onMediaTypeChange?.(value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border bg-card/40 p-4 shadow-sm">
      {/* Title */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Discover
        </p>
        <h2 className="text-sm sm:text-base font-semibold text-foreground">
          Filter Content
        </h2>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Quickly switch between video and audio content.
        </p>
      </div>

      {/* Media Filter Dropdown */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground sm:flex">
          <SlidersHorizontal className="h-3 w-3" />
          <span>Filter</span>
        </div>

        <Select
          value={mediaType}                                     // 👈 คุมจาก parent
          onValueChange={(val) => handleMediaTypeChange(val as MediaType)}
        >
          <SelectTrigger className="h-9 w-[150px] rounded-full border border-border bg-background/80 px-4 text-xs sm:text-sm shadow-none hover:bg-muted">
            <SelectValue placeholder="All types" />
          </SelectTrigger>

          <SelectContent className="text-xs sm:text-sm">
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" />
                <span>All Types</span>
              </div>
            </SelectItem>

            <SelectItem value="video">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-3 w-3" />
                <span>Video</span>
              </div>
            </SelectItem>

            <SelectItem value="audio">
              <div className="flex items-center gap-2">
                <Music2 className="h-3 w-3" />
                <span>Audio</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
