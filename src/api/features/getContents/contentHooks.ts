"use client";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchContents, fetchContentsPage } from './contentApi';
import type { ContentsParams } from './contentType';

export function useContents(params: ContentsParams) {
  return useQuery({
    queryKey: ['contents', params],
    queryFn: () => fetchContents(params),
    staleTime: 60_000,
  });
}

/** Infinite version (uses paginationStart cursor) */
export function useInfiniteContents(opts?: {
  pageSize?: number;
  q?: string;
  type?: string;
  exclusiveTo?: string;
}) {
    const pageSize = opts?.pageSize ?? 10;
    return useInfiniteQuery({
    queryKey: ['contents-infinite', { pageSize, ...opts }],
    queryFn: ({ pageParam = 0 }) =>
      fetchContentsPage(pageParam, pageSize, { q: opts?.q, type: opts?.type, exclusiveTo: opts?.exclusiveTo }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart, // undefined stops
    staleTime: 60_000,
  });
}
