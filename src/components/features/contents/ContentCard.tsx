import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import Image from "next/image";

export interface ContentCardProps {
  title: string;
  creatorName: string;
  subject: string;
  viewerCount: string;
  thumbnail?: string;
  creatorAvatar?: string;
  isLive?: boolean;
}

export default function StreamCard({
  title,
  creatorName: creatorName,
  subject: subject,
  viewerCount,
  thumbnail,
  creatorAvatar: creatorAvatar,
  isLive = false,
}: ContentCardProps) {
  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-all hover:shadow-lg hover:scale-105">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
            <span className="text-6xl font-bold text-white opacity-50">
              232 x 140
            </span>
          </div>
        )}
        
        {/* Live Badge */}
        {isLive && (
          <Badge className="absolute left-2 top-2 bg-red-500 text-white hover:bg-red-600">
            <div className="mr-1 h-2 w-2 rounded-full bg-white"></div>
            Live
          </Badge>
        )}

        {/* Viewer Count */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <Eye className="h-3 w-3" />
          <span>{viewerCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
          {title}
        </h3>
        
        <div className="mt-2 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={creatorAvatar} alt={creatorName} />
            <AvatarFallback className="text-xs">
              {creatorName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{creatorName}</p>
            <p className="truncate text-xs text-muted-foreground">{subject}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
