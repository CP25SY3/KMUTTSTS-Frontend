export type ContentItem = {
  documentId: string;
  title: string;
  description: string;
  type: "video" | "audio" | string;
  exclutiveTo: "public" | "authenticated" | "staff" | string;
  createdAt: string;
  thumbnail?: string;
};

export type ContentsResponse = ContentItem[];

export type ContentsParams = {
  paginationStart?: number; // 0, 10, 20, ...
  limit?: number; // only if your endpoint supports it
  q?: string; // optional search
  type?: string; // optional filter
  exclusiveTo?: string; // optional filter
};
