"use client";

import { useInfiniteContents } from "@/api/features/contents/contentHooks";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ContentCard } from ".";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCardProps(item: any) {
  return {
    title: item.title,
    creatorName: item.createName ?? "Unknown",
    subject: item.subject ?? "-",
    viewerCount: item.viewerCount ?? "1k",
    thumbnail: item.thumbnail ?? "",
    isLive: item.isLive ?? false,
    creatorAvatar: item.creatorAvatar ?? "",
  };
}

export default function ContentsGrid() {
  const router = useRouter();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteContents();

  const items = useMemo(
    () => (data?.pages.flatMap(p => p.items) ?? []),
    [data]
  );

  // IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || !sentinelRef.current) return;
    const el = sentinelRef.current;

    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: '200px' }); // prefetch a bit earlier

    io.observe(el);
    return () => io.unobserve(el);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <main className="mx-auto p-4">
      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <>
          {items.length === 0 ? (
            <p className="text-muted-foreground">No contents.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const props = toCardProps(item);
                return (
                  <ContentCard
                    key={item.documentId}
                    title={props.title}
                    creatorName={props.creatorName}
                    subject={props.subject}
                    viewerCount={props.viewerCount}
                    thumbnail={props.thumbnail}
                    creatorAvatar={props.creatorAvatar}
                    isLive={false}
                    onClick={() => {
                      router.push(`/watch/${item.documentId}`);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Load more (fallback / accessibility) */}
          {hasNextPage && (
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}

          {/* Sentinel for auto-fetch on scroll */}
          <div ref={sentinelRef} className="h-10 w-full" />
        </>
      )}
    </main>
  );

}
