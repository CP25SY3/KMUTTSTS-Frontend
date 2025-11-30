"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils";
import ContentHeaderSection from "./ContentHeaderSection";
import { AudioVisualizer } from "./AudioVisualizer";

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration?: number;
  onBack?: () => void;
  className?: string;
}

export function AudioPlayer({
  src,
  title,
  artist,
  thumbnailUrl,
  duration: initialDuration = 0,
  onBack,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Audio events and Context Initialization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize Audio Context if not already done
    const initAudioContext = () => {
      if (contextRef.current) return;

      try {
        const AudioContext =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext: typeof window.AudioContext;
            }
          ).webkitAudioContext;
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        contextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    };

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () =>
      !Number.isNaN(audio.duration) && setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    // Initialize context on first interaction (play) or immediately if possible
    // We'll try to init on mount, but handle the "already connected" case by checking refs
    initAudioContext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);

      // We do NOT close the context here because the audio element persists
      // and we can't create a new source for it if we unmount/remount.
      // The context will be garbage collected when the audio element is destroyed (on page navigation).
    };
  }, []);

  // Resume context on play
  useEffect(() => {
    if (isPlaying && contextRef.current?.state === "suspended") {
      contextRef.current.resume();
    }
  }, [isPlaying]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying((p) => !p);
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current || !duration) return;
    const newTime = (value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setIsMuted(v === 0);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "relative w-full max-w-5xl mx-auto bg-card text-card-foreground rounded-3xl overflow-hidden shadow-2xl flex flex-col",
        // Mobile: full viewport height, smaller padding
        "h-[90dvh] p-4 gap-4",
        // Desktop: auto height, larger padding
        "md:h-auto md:p-10 md:gap-6",
        className
      )}
    >
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-16 -left-20 h-64 w-64 rounded-full bg-primary blur-[110px]" />
        <div className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-secondary blur-[110px]" />
      </div>

      {/* HEADER */}
      <ContentHeaderSection onBack={onBack} title={title} artist={artist} />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 gap-2 sm:gap-4 md:gap-8 md:flex-row md:items-stretch">
        {/* ARTWORK */}
        <ArtworkSection
          thumbnailUrl={thumbnailUrl}
          title={title}
          isPlaying={isPlaying}
        />

        {/* RIGHT SIDE */}
        <div className="flex w-full flex-col justify-between gap-2  md:w-2/3 flex-1 min-h-0">
          <div className="flex-1 flex flex-col justify-center items-center min-h-[90px] h-full">
            <AudioVisualizer
              className="max-h-[200px]"
              analyser={analyserRef.current}
              isPlaying={isPlaying}
            />
          </div>

          <div className="flex flex-col gap-4 md:gap-6 mt-auto">
            <TimeSection
              progress={progress}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />

            <ControlSection
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              isMuted={isMuted}
              volume={volume}
              toggleMute={() => setIsMuted(!isMuted)}
              onVolume={(v: number) => handleVolumeChange(v)}
              audioRef={audioRef}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={src} crossOrigin="anonymous" />
    </div>
  );
}

/* --- SUB COMPONENTS --- */

function ArtworkSection({
  thumbnailUrl,
  title,
  isPlaying,
}: {
  thumbnailUrl?: string;
  title: string;
  isPlaying: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center md:shrink">
      <div className="relative aspect-square w-full max-w-[280px] min-w-[200px] overflow-hidden rounded-3xl border border-border shadow-2xl shrink-0">
        <Image
          src={thumbnailUrl || "/Podcast.jpg"}
          alt={title}
          fill
          className={cn(
            "object-cover transition-transform duration-[10s] ease-linear",
            isPlaying ? "scale-110" : "scale-100"
          )}
        />
      </div>
    </div>
  );
}

function TimeSection({
  progress,
  currentTime,
  duration,
  onSeek,
}: {
  progress: number;
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDuration(Math.floor(currentTime))}</span>
        <span>{formatDuration(Math.floor(duration))}</span>
      </div>

      <div className="relative">
        <div className="h-1.5 w-full rounded-full bg-muted/40">
          <div
            className="h-1.5 rounded-full bg-primary transition-[width] duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Range with visible dot thumb */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
          className={cn(
            "absolute inset-0 h-1.5 w-full cursor-pointer",
            "appearance-none bg-transparent",
            // WebKit
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-3",
            "[&::-webkit-slider-thumb]:w-3",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:border",
            "[&::-webkit-slider-thumb]:border-background",
            // Firefox
            "[&::-moz-range-thumb]:h-3",
            "[&::-moz-range-thumb]:w-3",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border",
            "[&::-moz-range-thumb]:border-background",
            // hide default track color
            "[&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-moz-range-track]:bg-transparent"
          )}
        />
      </div>
    </div>
  );
}

function ControlSection({
  isPlaying,
  togglePlay,
  isMuted,
  volume,
  toggleMute,
  onVolume,
  audioRef,
}: {
  isPlaying: boolean;
  togglePlay: () => void;
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  onVolume: (value: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  return (
    <div className="flex flex-col gap-4 shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* LEFT — Volume */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-transparent"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          <div className="relative w-28 h-1.5 rounded-full bg-muted/40 group cursor-pointer hidden sm:block">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-foreground/60 group-hover:bg-primary transition-colors"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
            {/* volume range with dot thumb */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              className={cn(
                "absolute inset-0 w-full h-full cursor-pointer",
                "appearance-none bg-transparent",
                // WebKit thumb
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:h-3",
                "[&::-webkit-slider-thumb]:w-3",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-foreground",
                "[&::-webkit-slider-thumb]:border",
                "[&::-webkit-slider-thumb]:border-background",
                // Firefox thumb
                "[&::-moz-range-thumb]:h-3",
                "[&::-moz-range-thumb]:w-3",
                "[&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:bg-foreground",
                "[&::-moz-range-thumb]:border",
                "[&::-moz-range-thumb]:border-background",
                // hide track
                "[&::-webkit-slider-runnable-track]:bg-transparent",
                "[&::-moz-range-track]:bg-transparent"
              )}
            />
          </div>
        </div>

        {/* CENTER — Playback */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-foreground hover:bg-muted/20"
          >
            <SkipBack className="h-6 w-6 fill-current" />
          </Button>

          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 translate-x-[2px] fill-current" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-foreground hover:bg-muted/20"
          >
            <SkipForward className="h-6 w-6 fill-current" />
          </Button>
        </div>

        {/* RIGHT — Repeat */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-transparent"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              if (!isPlaying) audioRef.current.play();
            }
          }}
        >
          <Repeat className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
