// src/api/features/channel/channelHooks.ts
"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchChannel, fetchChannelContentsPage } from "./channelApi";

export function useChannel(channelId: string) {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: () => fetchChannel(channelId),
    staleTime: 5 * 60 * 1000,
    enabled: !!channelId,
  });
}

export interface ChannelContentsOptions {
  pageSize?: number;
  contentType?: "video" | "audio"; // แทน mediaType
  search?: string;
}

export function useChannelContents(
  channelId: string,
  opts?: ChannelContentsOptions
) {
  const pageSize = opts?.pageSize ?? 8;
  const contentType = opts?.contentType ?? null;
  const search = opts?.search ?? null;

  console.log("%c[useChannelContents] options:", "color: #0af;", {
    channelId,
    pageSize,
    contentType,
    search,
  });

  return useInfiniteQuery({
    queryKey: [
      "channel-contents",
      channelId,
      pageSize,
      contentType,
      search,
    ],
    queryFn: ({ pageParam = 0 }) => {
      console.log("%c[QueryFn] Fetching page:", "color: #fa0;", {
        pageParam,
        pageSize,
        contentType: opts?.contentType,
        search: opts?.search,
      });

      return fetchChannelContentsPage(channelId, pageParam, pageSize, {
        contentType: opts?.contentType,
        search: opts?.search,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart,
    staleTime: 0,
    enabled: !!channelId,
  });
}

