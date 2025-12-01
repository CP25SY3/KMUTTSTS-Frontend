// src/components/features/contents/CategoryTabs.tsx
"use client";

import React from "react";
import { SlidersHorizontal, PlayCircle, Music2 } from "lucide-react";

export type MediaType = "all" | "video" | "audio";

interface CategoryTabsProps {
  mediaType: MediaType; // 👈 รับค่าจาก parent
  onMediaTypeChange?: (type: MediaType) => void;
}

export default function CategoryTabs({
  mediaType,
  onMediaTypeChange,
}: CategoryTabsProps) {
  const handleMediaTypeChange = (value: MediaType) => {
    onMediaTypeChange?.(value);
  };

  const tabs: { label: string; value: MediaType; icon: React.ReactNode }[] = [
    {
      label: "All Types",
      value: "all",
      icon: <SlidersHorizontal className="h-4 w-4" />,
    },
    {
      label: "Video",
      value: "video",
      icon: <PlayCircle className="h-4 w-4" />,
    },
    {
      label: "Audio",
      value: "audio",
      icon: <Music2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card/40 p-4 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Discover
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            Filter Content
          </h2>
        </div>

        {/* Optional: Add a subtle hint or secondary action here if needed */}
      </div>

      {/* Tabs Section */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = mediaType === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleMediaTypeChange(tab.value)}
              className={`
                group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              {/* Icon with subtle animation on active/hover */}
              <span
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
