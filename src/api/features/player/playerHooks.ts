"use client";
import { useQuery } from '@tanstack/react-query';
import { fetchVideoDetail } from './playerApi';

export function useVideoDetail(videoId: string, options?: { enablePolling?: boolean }) {
  return useQuery({
    queryKey: ['video-detail', videoId],
    queryFn: () => fetchVideoDetail(videoId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!videoId,
    refetchInterval: options?.enablePolling ? 3000 : false, // Poll every 3 seconds when enabled
    refetchIntervalInBackground: false,
  });
}