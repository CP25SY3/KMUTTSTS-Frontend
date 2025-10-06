/** Request payload for /api/playable-contents/transcode (multipart/form-data) */

export type PostContentPayload = {
    file: File;
    title: string;
    description?: string;
    type: "video" | "audio" | string;
    exclusiveTo?: "public" | "authenticated" | "staff" | string;
    thumbnail?: File; // for future use
}

export type PostContentResponse = {
    ok: boolean;
    documentId: string;
    queued: boolean;
}

/** Optional status response if you later add a status endpoint */
export type TranscodeStatus =
  | { state: 'queued' }
  | { state: 'processing'; pct?: number }
  | { state: 'ready'; slug?: string; url?: string }
  | { state: 'failed'; error?: string };