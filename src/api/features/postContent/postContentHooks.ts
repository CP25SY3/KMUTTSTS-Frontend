"use client";

import { useMutation } from "@tanstack/react-query";
import { PostContentPayload, PostContentResponse } from "./postContentType";
import { transcodePlayableXHR } from "./postContentApi";

type TranscodeVars = {
  payload: PostContentPayload;
  auth?: boolean;
  authToken?: string; // override token if needed
  onProgress?: (pct: number) => void;
  timeOutMs?: number;
  attachRef?: (xht: XMLHttpRequest) => void; // optional: allow cancel with xhr.abort()
  channelId: string;
};

export function useTranscodePlayable() {
  return useMutation<PostContentResponse, Error, TranscodeVars>({
    mutationFn: ({
      payload,
      onProgress,
      attachRef,
      auth = true,
      authToken,
      channelId,
    }) =>
      transcodePlayableXHR(payload, {
        auth, // 🔒 auto-read token from localStorage when true
        authToken, // or pass a custom token to override
        onProgress,
        attachRef,
        timeoutMs: 20 * 60_000, // 20 minutes
        channelId,
      }),
  });
}
