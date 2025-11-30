import { apiClient } from "@/api/shared/client";
import { pathEndpoints } from "@/api/shared/endpoints";
import { ContentDetailResponse } from "./playerTypes";

/** Fetch video details for the player */
export async function fetchContentDetail(
  contentId: string
): Promise<ContentDetailResponse> {
  try {
    const data = await apiClient.get<ContentDetailResponse>(
      pathEndpoints.player.detail(contentId)
    );

    return data;
  } catch (error) {
    console.error("Error fetching content detail:", error);
    throw error;
  }
}
