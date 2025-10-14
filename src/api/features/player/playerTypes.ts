export interface VideoRendition {
  label: string;
  width: number;
  height: number;
  bandwidth: number;
  codecs: string;
  frameRate: number;
  playlistUrl: string;
}

export interface VideoPlayback {
  hlsMasterUrl: string;
  renditions: VideoRendition[];
}

export interface VideoStatus {
  transcode: "pending" | "processing" | "completed" | "failed";
  processedAt?: string;
  error?: string | null;
}

export interface VideoFiles {
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  source: {
    url: string;
    mime: string;
    size: number;
  };
}

export interface VideoChannel {
  id: string;
  name: string;
  official: boolean;
  avatarUrl?: string;
}

export interface VideoRelations {
  uploader?: unknown | null;
  channel: VideoChannel;
}

export interface VideoTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface VideoDetailData {
  id: string;
  title: string;
  description: string;
  type: string;
  access: "public" | "private" | "unlisted";
  duration: number;
  status: VideoStatus;
  playback: VideoPlayback;
  files: VideoFiles;
  relations: VideoRelations;
  timestamps: VideoTimestamps;
}

export interface VideoDetailResponse {
  ok: boolean;
  data: VideoDetailData;
}