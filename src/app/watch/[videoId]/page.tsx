"use client";

import { useRef } from "react";
import HlsVideoPlayer, { HlsVideoPlayerHandle } from "@/components/features/video_player/HlsVideoPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/shared/Sidebar";
import { useParams } from "next/navigation";
import { useVideoDetail } from "@/api/features/player/playerHooks";
import { 
  Clock, 
  Eye, 
  Calendar, 
  Shield, 
  Download, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function PlayerPage() {
  const params = useParams<{ videoId: string }>();
  const videoId = params.videoId;
  const playerRef = useRef<HlsVideoPlayerHandle>(null);

  const { data: response, isLoading, error } = useVideoDetail(videoId);
  const video = response?.data;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB >= 1024) {
      const mb = sizeInKB / 1024;
      // Use toFixed(2) for more precision, then remove trailing zeros
      return `${parseFloat(mb.toFixed(2))} MB`;
    } else {
      return `${sizeInKB.toFixed(1)} KB`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto rounded-xl">
            {/* Loading skeleton */}
            <div className="space-y-6">
              <div className="w-full aspect-video rounded-lg bg-muted animate-pulse"></div>
              <div className="grid gap-6 lg:grid-cols-3">
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

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
              <p className="text-muted-foreground">
                The video you&apos;re looking for doesn&apos;t exist or is not available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl">
      <Sidebar />
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Video Player */}
          <div className="mb-6">
            {video.status.transcode === "completed" && video.playback.hlsMasterUrl ? (
              <HlsVideoPlayer
                ref={playerRef}
                src={video.playback.hlsMasterUrl}
                poster={video.files?.thumbnail?.url || "/api/placeholder/800/450"}
                autoPlay={false}
                muted={false}
                initialQuality="auto"
                capLevelToPlayerSize
                className="rounded-lg shadow-lg overflow-hidden bg-black"
                videoClassName="w-full aspect-video"
                controlsClassName="p-4"
                onError={(e) => console.error("Player error:", e)}
                onReady={() => console.log("Player ready")}
              />
            ) : (
              <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">
                    {video.status.transcode === "processing" ? "Processing video..." : "Video not ready"}
                  </div>
                  {video.status.error && (
                    <div className="text-sm text-red-500">Error: {video.status.error}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Info */}
              <div>
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(video.duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(video.timestamps.createdAt)}
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {video.access}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(video.status.transcode)}>
                    {getStatusIcon(video.status.transcode)}
                    {video.status.transcode}
                  </Badge>
                </div>
                {video.description && (
                  <p className="text-muted-foreground">{video.description}</p>
                )}
              </div>

              {/* Channel Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={video.relations?.channel?.avatarUrl || ""} 
                        alt={video.relations?.channel?.name || "Channel"} 
                      />
                      <AvatarFallback>
                        {video.relations?.channel?.name?.substring(0, 2).toUpperCase() || "CH"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/channel/${video.relations?.channel?.id || ""}`}>
                          <h3 className="font-semibold text-xl hover:text-primary cursor-pointer">
                            {video.relations?.channel?.name || "Unknown Channel"}
                          </h3>
                        </Link>
                        {video.relations?.channel?.official && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Official
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Video Details */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Video Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Video ID:</span>
                      <span className="font-mono text-xs">{video.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{video.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>
                        {video.playback?.renditions[0].width && video.playback?.renditions[0].height 
                          ? `${video.playback?.renditions[0].width} × ${video.playback?.renditions[0].height}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span>{video.files?.source?.size ? formatFileSize(video.files.source.size) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span>{video.files?.source?.mime || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Qualities */}
              {video.playback?.renditions && video.playback.renditions.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Available Qualities
                    </h3>
                    <div className="space-y-2">
                      {video.playback.renditions.map((rendition, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <div>
                            <div className="font-medium">{rendition.label || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">
                              {rendition.width || 0}×{rendition.height || 0} • {rendition.frameRate || 0}fps
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((rendition.bandwidth || 0) / 1000000).toFixed(1)}M
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
                  <h3 className="font-semibold mb-3">Processing Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(video.status.transcode)}
                      <span className="capitalize">{video.status.transcode}</span>
                    </div>
                    {video.status.processedAt && (
                      <div className="text-sm text-muted-foreground">
                        Processed: {formatDate(video.status.processedAt)}
                      </div>
                    )}
                    {video.status.error && (
                      <div className="text-sm text-red-500 p-2 rounded bg-red-50">
                        {video.status.error}
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
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={video.files.source?.url || ""} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Source Video ({formatFileSize(video.files.source.size)})
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={video.files.thumbnail?.url || ""} target="_blank" rel="noopener noreferrer">
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
