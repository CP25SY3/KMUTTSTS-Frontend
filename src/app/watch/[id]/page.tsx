"use client";

import { useEffect, useRef, useState } from "react";
import HlsVideoPlayer, { HlsVideoPlayerHandle } from "@/components/features/video_player/HlsVideoPlayer";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/shared/Sidebar";
import { useParams } from "next/navigation";

export default function PlayerPage() {
  const params = useParams<{ id: string }>();        // ✅ use slug, not id
  const videoId = params.id;

  const playerRef = useRef<HlsVideoPlayerHandle>(null);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [customSrc, setCustomSrc] = useState<string>("");

  useEffect(() => {
    if (!videoId) return;

    const baseUrl = `http://localhost:1337/uploads/videos/${encodeURIComponent(videoId)}`;
    const playlist = `${baseUrl}/master.m3u8`;

    let tries = 0;
    const maxTries = 20;          // ~60s
    let cancelled = false;

    const check = async () => {
      // add cache-buster to avoid caching a 404 from the very first probe
      const probeUrl = `${playlist}?cb=${Date.now()}`;

      try {
        const res = await fetch(probeUrl, { method: "HEAD", cache: "no-store" });
        if (cancelled) return;

        if (res.ok) {
          // when ready, use the clean URL (no cache-buster)
          setCurrentSrc(playlist);
          return;
        }

        if (tries++ < maxTries) {
          setTimeout(check, 3000);
        } else {
          console.error("HLS playlist not available after timeout:", playlist);
        }
      } catch (e) {
        if (cancelled) return;
        if (tries++ < maxTries) {
          setTimeout(check, 3000);
        } else {
          console.error("Error while checking HLS availability:", e);
        }
      }
    };

    check();
    return () => { cancelled = true; };
  }, [videoId]);

  const exampleStreams = [
    { name: "Apple Test Stream", src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8" },
    { name: "Bitmovin Demo", src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
  ];

  return (
    <div className="min-h-screen bg-background rounded-xl py-4">
      <Sidebar />
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">HLS Video Player</h1>
            <p className="text-muted-foreground">{videoId}</p>
          </div>

          <div className="mb-8">
            {currentSrc ? (
              <HlsVideoPlayer
                ref={playerRef}
                src={currentSrc}
                poster="https://preview.redd.it/who-is-the-original-artist-of-the-evernight-dance-gif-v0-y0i1r3mgq3tf1.gif?format=png8&s=405a72387a0192b6ed456505cacf09e72c1aec8f"
                autoPlay={false}
                muted={false}
                initialQuality="auto"
                capLevelToPlayerSize
                className="rounded-md shadow-lg overflow-hidden bg-black"
                videoClassName="w-full aspect-video"
                controlsClassName="p-4"
                onError={(e) => console.error("Player error:", e)}
                onReady={() => console.log("Player ready")}
              />
            ) : (
              <div className="w-full aspect-video rounded-2xl bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">Preparing your video…</div>
                  <div className="text-sm text-muted-foreground">This may take a moment ⏳</div>
                </div>
              </div>
            )}
          </div>

          {/* Optional: debug/demo stream loader */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Example Streams</h3>
              {exampleStreams.map((s) => (
                <div key={s.src} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="truncate max-w-xs text-sm text-muted-foreground">{s.src}</div>
                  <Button onClick={() => setCurrentSrc(s.src)} size="sm" variant={currentSrc === s.src ? "default" : "outline"}>
                    {currentSrc === s.src ? "Playing" : "Load"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Custom Stream</h3>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Enter HLS stream URL (.m3u8)"
                  value={customSrc}
                  onChange={(e) => setCustomSrc(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
                <Button onClick={() => customSrc && setCurrentSrc(customSrc)} disabled={!customSrc.trim()}>
                  Load
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
