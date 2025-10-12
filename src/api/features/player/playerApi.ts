import { apiClient } from "@/api/shared/client";
import { pathEndpoints } from "@/api/shared/endpoints";
import { VideoDetailResponse } from "./playerTypes";

/** Fetch video details for the player */
export async function fetchVideoDetail(videoId: string): Promise<VideoDetailResponse> {
  try {
    const data = await apiClient.get<VideoDetailResponse>(
      pathEndpoints.player.detail(videoId)
    );
    
    return data;
  } catch (error) {
    console.error("Error fetching video detail:", error);
    throw error;
  }
}