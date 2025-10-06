import { PostContentPayload, PostContentResponse } from "./postContentType";
import { pathEndpoints } from "@/api/shared/endpoints";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Upload to /api/playable-contents/transcode using XHR (with upload progress).
 * - Automatically attaches token if { auth: true }
 * - Supports custom token override with authToken
 */
export function transcodePlayableXHR(
  payload: PostContentPayload,
  opts?: {
    auth?: boolean;
    authToken?: string; // override token if needed
    onProgress?: (pct: number) => void;
    timeoutMs?: number;
    attachRef?: (xht: XMLHttpRequest) => void; // attach XMLHttpRequest reference if needed
  }
): Promise<PostContentResponse> {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${pathEndpoints.contents.upload}`;
    const form = new FormData();

    // append fields
    form.append("file", payload.file);
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    form.append("type", payload.type);
    form.append("exclusiveTo", payload.exclusiveTo ?? "public");
    if (payload.thumbnail) form.append("thumbnail", payload.thumbnail);

    const xhr = new XMLHttpRequest();
    if (opts?.timeoutMs) xhr.timeout = opts.timeoutMs;
    opts?.attachRef?.(xhr);

    // progress event
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts?.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    // open connection
    xhr.open("POST", url);

    try {
      // set auth header if needed
      let token: string | undefined;
      if (opts?.authToken) {
        token = opts.authToken;
      } else if (opts?.auth && typeof window !== "undefined") {
        token = localStorage.getItem("token") ?? undefined;
      }
      if (token) {
        xhr.setRequestHeader("authorization", `Bearer ${token}`);
      }
    } catch (err) {
      console.warn("annot access localStorage (possibly SSR).", err);
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch {
          reject(new Error("Invalid JSON from server"));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    // send form data
    xhr.send(form);
  });
}
