// src/api/features/channel/channelApi.ts
import { apiClient } from "@/api/shared/client";
import { pathEndpoints } from "@/api/shared/endpoints";
import { Channel, ChannelContentsParams, PlayableContent } from "./channelTypes";
import { mediaURL } from "@/utils";

/** Fetch channel by ID */
export async function fetchChannel(channelId: string): Promise<Channel> {
  try {
    const data = await apiClient.get<Channel>(
      pathEndpoints.channels.detail(channelId)
    );

    // Convert profile picture URL to absolute
    if (data.profilePicture) {
      data.profilePicture = mediaURL(data.profilePicture);
    }

    return data;
  } catch (error) {
    console.error("Error fetching channel:", error);
    throw error;
  }
}

/** Fetch channel contents */
export async function fetchChannelContents(
  params: ChannelContentsParams & { search?: string } 
): Promise<PlayableContent[]> {
  const q = new URLSearchParams();

  if (params.paginationStart != null) {
    q.set("paginationStart", String(params.paginationStart));
  }

  // ใช้ contentType เป็นตัวบอก video / audio
  if (params.contentType) {
    q.set("contentType", params.contentType);
  }

  // ถ้ามี search ก็ส่งให้ backend (แล้วแต่ backend จะรองรับหรือยัง)
  if (params.search) {
    q.set("q", params.search);
  }

  try {
    const url =
      `${pathEndpoints.channels.contents(params.channelId)}` +
      (q.toString() ? `?${q.toString()}` : "");

    console.log("[fetchChannelContents] GET", url);

    const data = await apiClient.get<PlayableContent[]>(url);

    // Convert thumbnail URLs to absolute
    return data.map((item) => {
      if (item.thumbnail) {
        item.thumbnail = mediaURL(item.thumbnail);
      }
      if (item.channel.profilePicture) {
        item.channel.profilePicture = mediaURL(item.channel.profilePicture);
      }
      return item;
    });
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
  extra?: { contentType?: string; search?: string } // ✅ รองรับ search ด้วย
) {
  console.log("[fetchChannelContentsPage] extra =", extra);

  const data = await fetchChannelContents({
    channelId,
    paginationStart: pageStart,
    limit: pageSize,
    ...(extra ?? {}),
  });

  return {
    data,
    nextStart: data.length === pageSize ? pageStart + pageSize : undefined,
  };
}
