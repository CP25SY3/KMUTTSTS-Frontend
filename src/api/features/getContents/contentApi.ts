import { apiClient } from "@/api/shared/client";
import { ContentItem, ContentsParams, ContentsResponse } from "./contentType";
import { pathEndpoints } from "@/api/shared/endpoints";
import { mediaURL } from "@/utils";

/** Build query string according to your endpoint (?paginationStart=0 etc.) */
function toQuery(params?: ContentsParams) {
  const qs = new URLSearchParams();
  if (params?.paginationStart != null)
    qs.set("paginationStart", String(params.paginationStart));
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.q) qs.set("q", params.q);
  if (params?.type) qs.set("type", params.type);
  if (params?.exclusiveTo) qs.set("exclusiveTo", params.exclusiveTo);
  return qs.toString();
}

/** Page-based fetch */
export async function fetchContents(
  params?: ContentsParams
): Promise<ContentItem[]> {
  const q = toQuery(params);
  const url = `${pathEndpoints.contents.list}${q ? `?${q}` : ""}`;
  const data = await apiClient.get<ContentsResponse>(url);
  // map to convert thumbnail URL
  return data.map((item) => ({
    ...item,
    thumbnail: mediaURL(item.thumbnail),
  }));
}

/** Infinite paging helper (returns nextStart for React Query) */
export async function fetchContentsPage(
  pageStart = 0,
  pageSize = 10,
  extra?: Omit<ContentsParams, "paginationStart" | "limit">
) {
  const data = await fetchContents({
    paginationStart: pageStart,
    limit: pageSize,
    ...extra,
  });
  const nextStart = data.length < pageSize ? undefined : pageStart + pageSize;
  return { items: data, nextStart };
}
