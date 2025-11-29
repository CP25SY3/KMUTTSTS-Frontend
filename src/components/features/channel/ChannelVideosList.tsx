// src/components/features/channel/ChannelVideosList.tsx
"use client";
import { useChannelContents } from "@/api/features/channel/channelHooks";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UniversalVideoCard } from "@/components/shared";
import { useRouter } from "next/navigation";

import CategoryTabs, {
  MediaType,
} from "@/components/features/contents/CategoryTabs";

interface ChannelVideosListProps {
  channelId: string;
}

export default function ChannelVideosList({
  channelId,
}: ChannelVideosListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("all");

  console.log(
    "[ChannelVideosList] mediaType =",
    mediaType,
    "search =",
    searchQuery
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useChannelContents(channelId, {
    pageSize: 8,
    contentType: mediaType === "all" ? undefined : mediaType,
    search: searchQuery || undefined,
  });

  const allVideos = data?.pages.flatMap((page) => page.data) ?? [];

  // IntersectionObserver for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || !sentinelRef.current) return;
    const el = sentinelRef.current;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "10px" }
    );
    io.observe(el);
    return () => io.unobserve(el);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CategoryTabs
          mediaType={mediaType} // 👈 คุมค่าจาก parent
          onMediaTypeChange={(type) => setMediaType(type)}
        />
        <div className="h-10 animate-pulse rounded bg-muted"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded bg-muted"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          Error loading channel videos. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter DDL: All / Video / Audio */}
      <CategoryTabs
        mediaType={mediaType} // 👈 คุมค่าจาก parent
        onMediaTypeChange={(type) => setMediaType(type)}
      />

      {/* Search and View Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contents in channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Videos */}
      {allVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-4xl">📹</div>
          <h3 className="mb-2 text-lg font-semibold">
            This channel has no content yet.
          </h3>
          <p className="text-muted-foreground">
            Check back later for new videos!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allVideos.map((video) => (
              <UniversalVideoCard
                key={video.documentId}
                content={video}
                onClick={() => router.push(`/watch/${video.documentId}`)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex items-center justify-center mt-6 pb-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 bg-primary"
              >
                {isFetchingNextPage ? "Loading…" : "Load More Contents"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Sentinel for auto-fetch on scroll */}
      <div ref={sentinelRef} className="h-8 w-full" />
    </div>
  );
}
