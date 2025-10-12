"use client";
import { useChannelContents } from "@/api/features/channel/channelHooks";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Grid, List, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import VideoCard from "./VideoCard";
import { useRouter } from "next/navigation";

interface ChannelVideosListProps {
  channelId: string;
}

export default function ChannelVideosList({ channelId }: ChannelVideosListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useChannelContents(channelId, {
    pageSize: 12,
    contentType: searchQuery || undefined,
  });

  const allVideos = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded bg-muted"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded bg-muted"></div>
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
      {/* Search and View Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
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
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {allVideos.map((video) => (
              <VideoCard
                key={video.documentId}
                content={video}
                onClick={() => router.push(`/watch/${video.documentId}`)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="px-8"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Videos"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}