"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Clock, Play, CheckCircle } from "lucide-react";
import Image from "next/image";
import { mediaURL } from "@/utils";
import { toImageSrc } from "@/utils/toImageSrc";

interface channelInfo {
  channelName?: string;
  creatorName?: string;
  profilePicture?: string;
  subject?: string;
  isOfficial?: boolean;
}
// Universal content interface that can accommodate different content types
export interface UniversalContent {
  documentId?: string;
  id?: string | number;
  title: string;
  description?: string;
  thumbnail?: string | { url: string };
  duration?: string;
  views?: number;
  viewerCount?: string;
  createdAt?: string;
  publishedAt?: string;
  type?: string;
  isLive?: boolean;
  channel?: channelInfo
}

interface UniversalVideoCardProps {
  content: UniversalContent;
  onClick?: () => void;
  showCreator?: boolean;
  showDescription?: boolean;
  variant?: "default" | "compact";
}

export default function UniversalVideoCard({
  content,
  onClick,
  showCreator = false,
  showDescription = false,
  variant = "default",
}: UniversalVideoCardProps) {
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    // Assuming duration is in seconds or HH:MM:SS format
    return duration;
  };

  const formatViews = (views?: number, viewerCount?: string) => {
    if (viewerCount) return viewerCount;
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Handle different thumbnail formats
  const getThumbnailUrl = () => {
    if (!content.thumbnail) return undefined;
    if (typeof content.thumbnail === "string") return content.thumbnail;
    if (typeof content.thumbnail === "object" && content.thumbnail.url) {
      return content.thumbnail.url;
    }
    return undefined;
  };

  const thumbnailUrl = getThumbnailUrl();
  const dateToShow = content.publishedAt || content.createdAt;
  const viewCount = formatViews(content.views, content.viewerCount);

  return (
    <Card
      className="overflow-hidden gap-2 border-0 bg-card shadow-sm transition-all hover:shadow-lg hover:scale-103 cursor-pointer py-0"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
        {thumbnailUrl ? (
          <Image
            // src={toImageSrc(thumbnailUrl)}
            src={mediaURL(thumbnailUrl)}
            alt={content.title}
            fill
            sizes="80"
            className="object-cover transition-transform group-hover:scale-110"
            priority={true}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
            <Play className="h-12 w-12 text-white opacity-50" />
          </div>
        )}

        {/* Live Badge */}
        {content.isLive && (
          <Badge className="absolute left-2 top-2 bg-red-500 text-white hover:bg-red-600">
            <div className="mr-1 h-2 w-2 rounded-full bg-white animate-pulse"></div>
            LIVE
          </Badge>
        )}

        {/* Duration */}
        {content.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70">
            <Clock className="mr-1 h-3 w-3" />
            {formatDuration(content.duration)}
          </Badge>
        )}

        {/* View Count */}
        {viewCount  && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            <span>{viewCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={variant === "compact" ? "p-3" : "p-4"}>
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
          {content.title}
        </h3>

        <div className="mt-1 space-y-1">
          {/* Show creator info if enabled */}
          {showCreator && (
            <div className="flex items-center gap-2">
              {
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={mediaURL(content.channel?.profilePicture)}
                    alt={content.channel?.channelName || content.channel?.channelName}
                  />
                  <AvatarFallback className="text-xs">
                    {(content.channel?.channelName || content.channel?.creatorName || "Unknown")
                      .substring(0, 1)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              }
              <p className="text-xs text-muted-foreground truncate">
                {content.channel?.channelName ||
                  content.channel?.creatorName ||
                  "Unknown Creator"}
              </p>
              {content.channel?.isOfficial && <CheckCircle className="h-3 w-3" />}
            </div>
          )}

          {/* Description */}
          {showDescription && content.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {content.description}
            </p>
          )}

          {/* Subject (for content items) */}
          {/* {content.subject && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {content.subject}
            </p>
          )} */}

          {/* Date */}
          {dateToShow && (
            <p className="text-xs text-muted-foreground">
              {formatDate(dateToShow)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
