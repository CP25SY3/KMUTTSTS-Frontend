"use client";

import { useEffect, useRef, useState } from "react";
import HlsVideoPlayer, {
  HlsVideoPlayerHandle,
  type CaptionTrack,
} from "@/components/features/video_player/HlsVideoPlayer";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/shared/Sidebar";
import { useParams } from "next/navigation";

export default function PlayerPage() {
  const params = useParams();
  const slug = params.id as string;

  const playerRef = useRef<HlsVideoPlayerHandle>(null);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [customSrc, setCustomSrc] = useState<string>("");

  useEffect(() => {
    if (slug) {
      const videoSrc = `http://localhost:1337/uploads/videos/${slug}/master.m3u8`
      setCurrentSrc(videoSrc);
    }
  }, [slug]);

  // Example HLS streams for testing
  const exampleStreams = [
    {
      name: "Apple Test Stream",
      src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
      poster: "/api/placeholder/800/450",
    },
    {
      name: "Bitmovin Demo",
      src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      poster: "/api/placeholder/800/450",
    },
  ];

  const exampleCaptions: CaptionTrack[] = [
    {
      src: "/api/placeholder/captions/en.vtt",
      srclang: "en",
      label: "English",
      default: true,
    },
    {
      src: "/api/placeholder/captions/th.vtt",
      srclang: "th",
      label: "ภาษาไทย",
    },
  ];

  const handleLoadStream = (src: string) => {
    setCurrentSrc(src);
  };

  const handleLoadCustomStream = () => {
    if (customSrc.trim()) {
      setCurrentSrc(customSrc.trim());
    }
  };

  const handleQualityChanged = (payload: {
    levelIndex: number;
    height?: number;
    bitrateKbps?: number;
  }) => {
    console.log("Quality changed:", payload);
  };

  const handleStats = (payload: {
    bandwidthKbps?: number;
    bufferSec?: number;
  }) => {
    console.log("Player stats:", payload);
  };

  const handleError = (error: unknown) => {
    console.error("Player error:", error);
  };

  return (
    <div className="min-h-screen bg-background rounded-xl py-4">
      <Sidebar />
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              HLS Video Player 
            </h1>
            <p className="text-muted-foreground">
              {slug}
            </p>
          </div>

          {/* Video Player */}
          <div className="mb-8">
            {currentSrc ? (
              <HlsVideoPlayer
                ref={playerRef}
                src={currentSrc}
                poster="/api/placeholder/1280/720"
                captions={exampleCaptions}
                autoPlay={false}
                muted={false}
                initialQuality="auto"
                capLevelToPlayerSize={true}
                className="rounded-md shadow-lg overflow-hidden bg-black"
                videoClassName="w-full aspect-video"
                controlsClassName="p-4"
                onQualityChanged={handleQualityChanged}
                onStats={handleStats}
                onError={handleError}
                onReady={() => console.log("Player ready")}
                onPlay={() => console.log("Player started")}
                onPause={() => console.log("Player paused")}
                onEnded={() => console.log("Player ended")}
              />
            ) : (
              <div className="w-full aspect-video rounded-2xl bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">
                    No stream selected
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Choose a stream below to start playing
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Stream Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Select Stream
              </h2>

              {/* Example Streams */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Example Streams
                </h3>
                {exampleStreams.map((stream, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <div className="font-medium text-card-foreground">
                        {stream.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {stream.src}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleLoadStream(stream.src)}
                      variant={
                        currentSrc === stream.src ? "default" : "outline"
                      }
                      size="sm"
                    >
                      {currentSrc === stream.src ? "Playing" : "Load"}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Custom Stream */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Custom Stream
                </h3>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter HLS stream URL (.m3u8)"
                    value={customSrc}
                    onChange={(e) => setCustomSrc(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                  <Button
                    onClick={handleLoadCustomStream}
                    disabled={!customSrc.trim()}
                  >
                    Load
                  </Button>
                </div>
              </div>
            </div>
            {/* Player Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Player Info
              </h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>Check console for quality changes and stats</div>
                <div>
                  Keyboard shortcuts: Space/K (play/pause), M (mute), F
                  (fullscreen)
                </div>
                <div>Arrow keys: ←→ (seek ±5s), ↑↓ (volume ±10%)</div>
                <div>Click video to play/pause</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
