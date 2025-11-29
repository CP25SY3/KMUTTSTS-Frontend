"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  ArrowLeft,
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

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration?: number;
  onBack?: () => void;
  className?: string;
}

// Random waveform values (not symmetric)
const FULL_WAVE = Array.from(
  { length: 100 },
  () => Math.floor(Math.random() * (100 - 5 + 1)) + 5
);

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

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () =>
      !Number.isNaN(audio.duration) && setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

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
        "relative w-full max-w-5xl mx-auto bg-card text-card-foreground rounded-3xl overflow-hidden shadow-2xl px-6 py-5 md:px-10 md:py-8 flex flex-col gap-6",
        className
      )}
    >
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-16 -left-20 h-64 w-64 rounded-full bg-primary blur-[110px]" />
        <div className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-secondary blur-[110px]" />
      </div>

      {/* HEADER */}
      <HeaderSection onBack={onBack} title={title} artist={artist} />

      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-stretch">
        {/* ARTWORK */}
        <ArtworkSection
          thumbnailUrl={thumbnailUrl}
          title={title}
          isPlaying={isPlaying}
        />

        {/* RIGHT SIDE */}
        <div className="flex w-full flex-col justify-between gap-6 md:w-2/3">
          <TimeSection
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />

          <WaveformSection isPlaying={isPlaying} />

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

      <audio ref={audioRef} src={src} />
    </div>
  );
}

/* --- SUB COMPONENTS --- */

function HeaderSection({
  onBack,
  title,
  artist,
}: {
  onBack?: () => void;
  title: string;
  artist: string;
}) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted/20 rounded-full"
            onClick={onBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Now Playing
          </span>
          <span className="text-lg font-semibold leading-tight">{title}</span>
          <span className="text-sm text-muted-foreground">{artist}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-foreground hover:bg-muted/20 rounded-full"
      >
        <Heart className="h-6 w-6" />
      </Button>
    </div>
  );
}

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
    <div className="flex w-full flex-col items-center md:w-1/3">
      <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-border shadow-2xl">
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
    <div className="flex flex-col gap-3">
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

function WaveformSection({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex h-32 w-full items-center justify-center">
      <style jsx>{`
        @keyframes noisy-wave {
          0% {
            transform: scaleY(0.8);
          }
          10% {
            transform: scaleY(1.1);
          }
          20% {
            transform: scaleY(0.9);
          }
          30% {
            transform: scaleY(1.2);
          }
          40% {
            transform: scaleY(0.95);
          }
          50% {
            transform: scaleY(0.7);
          }
          60% {
            transform: scaleY(1.15);
          }
          70% {
            transform: scaleY(0.85);
          }
          80% {
            transform: scaleY(1.05);
          }
          90% {
            transform: scaleY(0.75);
          }
          100% {
            transform: scaleY(0.9);
          }
        }
      `}</style>

      <div className="flex h-full items-center justify-center gap-[2px]">
        {FULL_WAVE.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-[3px] rounded-full bg-foreground opacity-80 transition-all duration-100",
              isPlaying && "animate-[noisy-wave_1.5s_ease-in-out_infinite]"
            )}
            style={{
              height: `${h}%`,
              animationDelay: `${Math.random() * -1}s`,
              opacity: isPlaying ? 1 : 0.2,
            }}
          />
        ))}
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
    <div className="flex flex-col gap-4">
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

          <div className="relative w-28 h-1.5 rounded-full bg-muted/40 group cursor-pointer">
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
