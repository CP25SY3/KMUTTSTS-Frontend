// Video upload types for Strapi v5 integration

export interface StrapiFile {
  id: number;
  url: string;
  mime: string;
  name: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
}

export type StrapiUploadResponse = StrapiFile[];

export interface VideoMetadata {
  title: string;
  description?: string;
  visibility: 'public' | 'unlisted' | 'private';
  tags: string[];
  status: 'queued' | 'processing' | 'ready' | 'failed';
  slug?: string;
  source?: number;
  thumbnail?: number;
  posterUrl?: string;
  hlsMasterUrl?: string;
  ingestJobId?: string;
  errorMessage?: string;
}

export interface StrapiVideoResponse {
  data: {
    id: number;
    attributes: VideoMetadata & {
      createdAt: string;
      updatedAt: string;
      publishedAt?: string;
    };
  };
}

export interface StrapiVideoListResponse {
  data: Array<{
    id: number;
    attributes: VideoMetadata & {
      createdAt: string;
      updatedAt: string;
      publishedAt?: string;
    };
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface VideoUploadFormProps {
  channelId: string;
  authToken?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  allowedAudioTypes?: string[];
  maxThumbnailSizeBytes?: number;
  allowedThumbnailTypes?: string[];
  defaultVisibility?: 'public' | 'authenticated' | 'staff';
  className?: string;
  onSuccess?: (payload: { id: string }) => void;
  onError?: (message: string) => void;
}

export interface UploadProgressCardProps {
  phase: 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';
  uploadPct?: number;
  processPct?: number;
  errorMessage?: string | null;
  onRetry?: () => void;
  onView?: () => void;
  className?: string;
}

export interface VideoFormData {
  title: string;
  description: string;
  type: 'video' | 'audio';
  visibility: 'public' | 'authenticated' | 'staff';
  tags: string;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  tags?: string;
  file?: string;
  thumbnail?: string;
}

// Constants
export const DEFAULT_ALLOWED_TYPES = [
  'video/mp4',
  'video/quicktime', 
  'video/x-matroska',
  'video/webm'
];

export const DEFAULT_ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4'
];

export const DEFAULT_ALLOWED_THUMBNAIL_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const DEFAULT_MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB
export const DEFAULT_MAX_THUMBNAIL_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const POLLING_INTERVAL_MS = 3000; // 3 seconds
export const POLLING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const TAG_LIMITS = {
  MAX_COUNT: 10,
  MIN_LENGTH: 1,
  MAX_LENGTH: 32
} as const;

export const FIELD_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 120,
  DESCRIPTION_MAX: 2000
} as const;