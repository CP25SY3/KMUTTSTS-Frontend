"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchContentDetail } from "./playerApi";

export function useContentDetail(
  contentId: string,
  options?: { enablePolling?: boolean }
) {
  return useQuery({
    queryKey: ["content-detail", contentId],
    queryFn: () => fetchContentDetail(contentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!contentId,
    refetchInterval: options?.enablePolling ? 3000 : false, // Poll every 3 seconds when enabled
    refetchIntervalInBackground: false,
  });
}
