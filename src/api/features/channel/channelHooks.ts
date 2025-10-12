"use client";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchChannel, fetchChannelContentsPage } from './channelApi';

export function useChannel(channelId: string) {
  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: () => fetchChannel(channelId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!channelId,
  });
}

export function useChannelContents(channelId: string, opts?: {
  pageSize?: number;
  contentType?: string;
}) {
  const pageSize = opts?.pageSize ?? 12;
  
  return useInfiniteQuery({
    queryKey: ['channel-contents', channelId, { pageSize, ...opts }],
    queryFn: ({ pageParam = 0 }) =>
      fetchChannelContentsPage(channelId, pageParam, pageSize, { contentType: opts?.contentType }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart,
    staleTime: 60_000,
    enabled: !!channelId,
  });
}