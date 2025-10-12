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
  id: number;
  documentId: string;
  title: string;
  description?: string;
  thumbnail?: {
    id: number;
    documentId: string;
    name: string;
    url: string;
    width: number;
    height: number;
    ext: string;
    mime: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
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