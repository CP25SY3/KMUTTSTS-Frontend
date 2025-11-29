export interface ContentRendition {
  label: string;
  width: number;
  height: number;
  bandwidth: number;
  codecs: string;
  frameRate: number;
  playlistUrl: string;
}

export interface ContentPlayback {
  hlsMasterUrl: string;
  renditions: ContentRendition[];
}

export interface ContentStatus {
  transcode: "pending" | "processing" | "completed" | "failed";
  processedAt?: string;
  error?: string | null;
}

export interface ContentFiles {
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

export interface ContentChannel {
  id: string;
  name: string;
  official: boolean;
  avatarUrl?: string;
}

export interface ContentRelations {
  uploader?: unknown | null;
  channel: ContentChannel;
}

export interface ContentTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface ContentDetailData {
  id: string;
  title: string;
  description: string;
  type: string;
  access: "public" | "private" | "unlisted";
  duration: number;
  status: ContentStatus;
  playback: ContentPlayback;
  files: ContentFiles;
  relations: ContentRelations;
  timestamps: ContentTimestamps;
}

export interface ContentDetailResponse {
  ok: boolean;
  data: ContentDetailData;
}
