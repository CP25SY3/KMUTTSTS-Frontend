import { apiClient } from "@/api/shared/client";
import { pathEndpoints } from "@/api/shared/endpoints";
import { Channel, ChannelContentsParams, PlayableContent } from "./channelTypes";
import { mediaURL } from "@/utils";
import { Item } from "@radix-ui/react-dropdown-menu";

/** Fetch channel by ID */
export async function fetchChannel(channelId: string): Promise<Channel> {
  try {
    const data = await apiClient.get<Channel>(
      pathEndpoints.channels.detail(channelId)
    );
    
    // Convert profile picture URL to absolute
    if (data.profilePicture) {
      data.profilePicture = mediaURL(data.profilePicture) || data.profilePicture;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching channel:", error);
    throw error;
  }
}

/** Fetch channel contents */
export async function fetchChannelContents(
  params: ChannelContentsParams
): Promise<PlayableContent[]> {
  const q = new URLSearchParams();
  if (params.paginationStart != null)
    q.set("paginationStart", String(params.paginationStart));
  if (params.contentType) q.set("contentType", params.contentType);
  if (params.limit != null) q.set("limit", String(params.limit));

  try {
    const data = await apiClient.get<PlayableContent[]>(
      `${pathEndpoints.channels.contents(params.channelId)}${q.toString() ? `?${q.toString()}` : ""}`
    );
    
    // Convert thumbnail URLs to absolute
    return data.map((item) => {
        if (item.thumbnail) {
            item.thumbnail = mediaURL(item.thumbnail);
        }
        return item;
    })
  } catch (error) {
    console.error("Error fetching channel contents:", error);
    return [];
  }
}

/** Infinite paging helper for channel contents */
export async function fetchChannelContentsPage(
  channelId: string,
  pageStart = 0,
  pageSize = 10,
  extra?: { contentType?: string }
) {
  const data = await fetchChannelContents({
    channelId,
    paginationStart: pageStart,
    limit: pageSize,
    ...extra,
  });

  return {
    data,
    nextStart: data.length === pageSize ? pageStart + pageSize : undefined,
  };
}