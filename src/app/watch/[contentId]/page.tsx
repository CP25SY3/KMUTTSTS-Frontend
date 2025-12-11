"use client";

import { useRef, useState, useEffect } from "react";
import HlsVideoPlayer, {
  HlsVideoPlayerHandle,
} from "@/components/features/player/HlsVideoPlayer";
import { AudioPlayer } from "@/components/features/player/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { useContentDetail } from "@/api/features/player/playerHooks";
import {
  Clock,
  Eye,
  Calendar,
  Shield,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatDuration, formatFileSize } from "@/utils";
import ContentHeaderSection from "@/components/features/player/ContentHeaderSection";

export default function PlayerPage() {
  const params = useParams<{ contentId: string }>();
  const contentId = params.contentId;
  const playerRef = useRef<HlsVideoPlayerHandle>(null);
  const router = useRouter();

  // Determine if we should enable polling based on the current status
  const [shouldPoll, setShouldPoll] = useState(true);

  const {
    data: response,
    isLoading,
    error,
  } = useContentDetail(contentId, {
    enablePolling: shouldPoll,
  });
  const content = response?.data;

  // Update polling state based on video status
  useEffect(() => {
    if (content?.status?.transcode) {
      const status = content.status.transcode;
      console.log(`content status: ${status}, Polling: ${shouldPoll}`);

      if (status === "completed" || status === "failed") {
        setShouldPoll(false);
        console.log("Stopping polling - video processing finished");
      } else if (status === "processing") {
        setShouldPoll(true);
        console.log("Starting polling - video is processing");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, error]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-2 sm:p-6">
          <div className="max-w-6xl mx-auto rounded-xl">
            {/* Loading skeleton */}
            <div className="space-y-4 sm:space-y-6">
              <div className="w-full aspect-video rounded-lg bg-muted animate-pulse"></div>
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                  <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-48 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-2 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold mb-2">
                Video Not Found
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base px-4">
                The video you&apos;re looking for doesn&apos;t exist or is not
                available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-3xl">
      <div
        className="p-4 md:p-6"
        {...(content.type === "audio" ? { hidden: true } : {})}
      >
        <ContentHeaderSection
          onBack={() => router.back()}
          title={content.title}
          artist={content.relations?.channel?.name || "Unknown Creator"}
        />
      </div>
      <div className="container mx-auto p-2 sm:p-2">
        <div className="max-w-6xl mx-auto">
          {/* Content Player */}
          <div className="mb-6 p-0 md:p-4">
            {content.type === "audio" ? (
              content.playback?.hlsMasterUrl ? (
                <AudioPlayer
                src={content.playback.hlsMasterUrl}
                title={content.title}
                artist={content.relations?.channel?.name || "Unknown Creator"}
                thumbnailUrl={content.files?.thumbnail?.url}
                duration={content.duration}
                onBack={() => router.back()}
                />
              ) : (
                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-muted-foreground mb-2">
                      {content.status.transcode === "processing"
                        ? "Processing..."
                        : "Audio not available"}
                    </div>
                    {content.status.error && (
                      <div className="text-sm text-red-500">
                        Error: {content.status.error}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : content.status.transcode === "completed" &&
              content.playback.hlsMasterUrl ? (
              <HlsVideoPlayer
                ref={playerRef}
                src={content.playback.hlsMasterUrl}
                poster={
                  content.files?.thumbnail?.url || "/api/placeholder/800/450"
                }
                autoPlay={false}
                muted={false}
                initialQuality="auto"
                capLevelToPlayerSize
                className="rounded-lg shadow-lg overflow-hidden bg-black"
                videoClassName=""
                controlsClassName="p-4"
                onError={(e) => console.error("Player error:", e)}
                onReady={() => console.log("Player ready")}
              />
            ) : (
              <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">
                    {content.status.transcode === "processing"
                      ? "Processing..."
                      : "Video not ready"}
                  </div>
                  {content.status.error && (
                    <div className="text-sm text-red-500">
                      Error: {content.status.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 p-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Content Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(content.duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(content.timestamps.createdAt)}
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {content.access}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(content.status.transcode)}
                  >
                    {getStatusIcon(content.status.transcode)}
                    {content.status.transcode}
                  </Badge>
                  {shouldPoll && content.status.transcode === "processing" && (
                    <Badge variant="secondary" className="text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Auto-refreshing...
                    </Badge>
                  )}
                </div>
                {content.description && (
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {content.description}
                  </p>
                )}
              </div>

              {/* Channel Info */}
              <Link href={`/channel/${content.relations?.channel?.id}`}>
                <div className="flex items-center gap-4 md:gap-6 py-4">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarImage
                      className="object-cover"
                      src={content.relations?.channel?.avatarUrl || ""}
                      alt={content.relations?.channel?.name || "Channel"}
                    />
                    <AvatarFallback>
                      {content.relations?.channel?.name
                        ?.substring(0, 2)
                        .toUpperCase() || "CH"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-xl hover:text-primary cursor-pointer">
                        {content.relations?.channel?.name || "Unknown Channel"}
                      </h3>
                      {content.relations?.channel?.official && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Official
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-4">
              {/* Content Details */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Content Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Video ID:</span>
                      <span className="font-mono text-xs">{content.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{content.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(content.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>
                        {content.playback?.renditions[0]?.width &&
                        content.playback?.renditions[0].height
                          ? `${content.playback?.renditions[0].width} × ${content.playback?.renditions[0].height}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span>
                        {content.files?.source?.size
                          ? formatFileSize(content.files.source.size)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span>{content.files?.source?.mime || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Qualities */}
              {content.playback?.renditions &&
                content.playback.renditions.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Available Qualities
                      </h3>
                      <div className="space-y-2">
                        {content.playback.renditions.map((rendition, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 rounded bg-muted/50"
                          >
                            <div>
                              <div className="font-medium">
                                {rendition.label || "Unknown"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {rendition.width || 0}×{rendition.height || 0} •{" "}
                                {rendition.frameRate || 0}fps
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {((rendition.bandwidth || 0) / 1000000).toFixed(
                                1
                              )}
                              M
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Processing Status */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">
                    Processing Status
                    {shouldPoll &&
                      content.status.transcode === "processing" && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Auto-refreshing
                        </Badge>
                      )}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(content.status.transcode)}
                      <span className="capitalize">
                        {content.status.transcode}
                      </span>
                    </div>
                    {content.status.processedAt && (
                      <div className="text-sm text-muted-foreground">
                        Processed: {formatDate(content.status.processedAt)}
                      </div>
                    )}
                    {content.status.error && (
                      <div className="text-sm text-red-500 p-2 rounded bg-red-50">
                        {content.status.error}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Download Links */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloads
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={content.files.source?.url || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Source ({formatFileSize(content.files.source.size)})
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={content.files.thumbnail?.url || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Thumbnail Image
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
