"use client";
import { useChannel } from "@/api/features/channel/channelHooks";
import { ChannelHeader, ChannelVideosList } from "@/components/features/channel";
import { useParams } from "next/navigation";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const { data: channel, isLoading, error } = useChannel(channelId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="rounded-lg bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-24 w-24 animate-pulse rounded-full bg-muted"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              <div className="h-16 w-full animate-pulse rounded bg-muted"></div>
            </div>
            <div className="h-10 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        </div>

        {/* Videos Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-4xl">😞</div>
        <h2 className="mb-2 text-xl font-semibold">Channel not found</h2>
        <p className="text-muted-foreground">
          The channel you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChannelHeader channel={channel} />
      <ChannelVideosList channelId={channelId} />
    </div>
  );
}