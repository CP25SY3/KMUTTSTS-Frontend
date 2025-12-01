"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Clock, Play, CheckCircle, Music2 } from "lucide-react";
import Image from "next/image";
import { mediaURL } from "@/utils";

interface ChannelInfo {
  documentId?: string;
  channelName?: string;
  creatorName?: string;
  profilePicture?: string;
  subject?: string;
  isOfficial?: boolean;
}

type ContentType = "audio" | "video" | string;

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
  type?: ContentType;
  isLive?: boolean;
  channel?: ChannelInfo;
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
    // TODO: ถ้าต่อไป duration เป็นวินาที ค่อยมา parse เพิ่ม
    return duration;
  };

  const formatViews = (views?: number, viewerCount?: string) => {
    if (viewerCount) return viewerCount;
    if (!views) return "0";
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
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
  const contentType: ContentType = content.type ?? "video";

  const avatarSrc = content.channel?.profilePicture
    ? mediaURL(content.channel.profilePicture)
    : undefined;

  const channelDisplayName =
    content.channel?.channelName ||
    content.channel?.creatorName ||
    "Unknown";

  return (
    <Card
      className="overflow-hidden gap-2 border-0 bg-card shadow-sm transition-all hover:shadow-lg hover:scale-103 cursor-pointer py-0"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
        {thumbnailUrl ? (
          <Image
            // ถ้า mediaURL ตรวจว่าเป็น full URL อยู่แล้ว ตรงนี้จะ OK
            src={mediaURL(thumbnailUrl)}
            alt={content.title}
            fill
            sizes="80"
            className="object-cover transition-transform group-hover:scale-110"
            priority={true}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
            {contentType === "audio" ? (
              <Music2 className="h-12 w-12 text-white opacity-60" />
            ) : (
              <Play className="h-12 w-12 text-white opacity-50" />
            )}
          </div>
        )}

        {/* Live Badge */}
        {content.isLive && (
          <Badge className="absolute left-2 top-2 bg-red-500 text-white hover:bg-red-600">
            <div className="mr-1 h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </Badge>
        )}

        {/* Content Type Badge (audio / video) */}
        {contentType && (
          <Badge className="absolute left-2 bottom-2 flex items-center gap-1.5 bg-black/60 text-white backdrop-blur-md border-0 px-2 py-1 text-[10px] font-medium uppercase tracking-wider hover:bg-black/70">
            {contentType === "audio" ? (
              <Music2 className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {contentType}
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
        {viewCount && (
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
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={avatarSrc}
                  alt={channelDisplayName}
                />
                <AvatarFallback className="text-xs">
                  {channelDisplayName.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <p className="text-xs text-muted-foreground truncate">
                {content.channel?.channelName ||
                  content.channel?.creatorName ||
                  "Unknown Creator"}
              </p>

              {content.channel?.isOfficial && (
                <CheckCircle className="h-3 w-3" />
              )}
            </div>
          )}

          {/* Description */}
          {showDescription && content.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {content.description}
            </p>
          )}

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
