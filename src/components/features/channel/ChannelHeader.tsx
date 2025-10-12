"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Channel } from "@/api/features/channel/channelTypes";

interface ChannelHeaderProps {
  channel: Channel;
}


export default function ChannelHeader({ channel }: ChannelHeaderProps) {
    const contentCount = channel.playable_contents?.length || 0;
  
  return (
    <div className="flex flex-col gap-6 rounded-lg bg-card p-6 shadow-sm">
      {/* Channel Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Profile Picture */}
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={channel.profilePicture} alt={channel.channelName} />
          <AvatarFallback className="text-2xl font-bold">
            {channel.channelName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Channel Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {channel.channelName}
            </h1>
            {channel.isOfficial && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Official
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{contentCount} {contentCount === 1 ? 'video' : 'videos'}</span>
            </div>
            {channel.createdAt && (
              <>
                <span>•</span>
                <span>
                  Created {new Date(channel.createdAt).toLocaleDateString()}
                </span>
              </>
            )}
            {!channel.isActive && (
              <>
                <span>•</span>
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              </>
            )}
          </div>

          {channel.description && (
            <p className="text-muted-foreground">
              {channel.description}
            </p>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex shrink-0">
          <Link href="/upload">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}