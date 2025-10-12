"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock } from "lucide-react";
import Image from "next/image";
import { PlayableContent } from "@/api/features/channel/channelTypes";

interface VideoCardProps {
  content: PlayableContent;
  onClick?: () => void;
}

export default function VideoCard({ content, onClick }: VideoCardProps) {
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    // Assuming duration is in seconds or HH:MM:SS format
    return duration;
  };

  const formatViews = (views?: number) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
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

  const cardContent = (
    <Card 
      className="group overflow-hidden border-0 bg-card shadow-sm transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
        {content.thumbnail?.url ? (
          <Image
            src={content.thumbnail.url}
            alt={content.title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
            <span className="text-lg font-bold text-white opacity-50">
              No Thumbnail
            </span>
          </div>
        )}
        
        {/* Duration */}
        {content.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70">
            <Clock className="mr-1 h-3 w-3" />
            {formatDuration(content.duration)}
          </Badge>
        )}

        {/* View Count */}
        {content.views !== undefined && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            <span>{formatViews(content.views)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
          {content.title}
        </h3>
        
        <div className="mt-2 space-y-1">
          {content.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {content.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDate(content.publishedAt)}
          </p>
        </div>
      </div>
    </Card>
  );

  return cardContent;
}