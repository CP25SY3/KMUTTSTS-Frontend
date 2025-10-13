export interface Channel {
  documentId: string;
  channelName: string;
  description?: string;
  isOfficial: boolean;
  isActive: boolean;
  profilePicture?: string;
  playable_contents?: PlayableContent[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface PlayableContent {
  documentId: string;
  title: string;
  description?: string;
  type?: string;
  exclusiveTo?: string;
  thumbnail?: string;
  channel: Channel;
  duration?: string;
  views?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type ChannelContentsParams = {
  channelId: string;
  paginationStart?: number;
  contentType?: string;
  limit?: number;
};