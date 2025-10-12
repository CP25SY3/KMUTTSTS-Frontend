"use client";
import { useQuery } from '@tanstack/react-query';
import { fetchVideoDetail } from './playerApi';

export function useVideoDetail(videoId: string) {
  return useQuery({
    queryKey: ['video-detail', videoId],
    queryFn: () => fetchVideoDetail(videoId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!videoId,
  });
}