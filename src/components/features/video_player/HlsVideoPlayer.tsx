"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { mediaURL } from "@/utils";

export type QualityPreference =
  | "auto"
  | { levelIndex: number }
  | { height: number };

export type HlsVideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  initialQuality?: QualityPreference;
  className?: string;
  videoClassName?: string;
  controlsClassName?: string;
  capLevelToPlayerSize?: boolean;
  startLevel?: number;
  lowLatencyMode?: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onQualityChanged?: (payload: {
    levelIndex: number;
    height?: number;
    bitrateKbps?: number;
  }) => void;
  onStats?: (payload: { bandwidthKbps?: number; bufferSec?: number }) => void;
};

export type HlsVideoPlayerHandle = {
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  setQuality: (pref: QualityPreference) => void;
  getCurrentLevel: () => number;
  getLevels: () => Array<{
    index: number;
    height?: number;
    bitrateKbps?: number;
  }>;
  getVideoElement: () => HTMLVideoElement | null;
};

type QualityLevel = {
  index: number;
  height?: number;
  bitrateKbps?: number;
  label: string;
};

const HlsVideoPlayer = forwardRef<HlsVideoPlayerHandle, HlsVideoPlayerProps>(
  (
    {
      src,
      poster,
      autoPlay = false,
      muted = false,
      playsInline = true,
      preload = "metadata",
      initialQuality = "auto",
      className,
      videoClassName,
      controlsClassName,
      capLevelToPlayerSize = true,
      startLevel = -1,
      lowLatencyMode = false,
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      onQualityChanged,
      onStats,
    },
    ref
  ) => {
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const clickCountRef = useRef(0);
    const keyboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isKeyboardHandledRef = useRef(false);
    const mouseInactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [selectedQuality, setSelectedQuality] = useState<number>(-1); // User's selection: -1 for auto, or specific level index
    const [actualPlayingLevel, setActualPlayingLevel] = useState<number>(-1); // The actual level being played
    const [isNativeHls, setIsNativeHls] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bufferedTime, setBufferedTime] = useState(0);
    const [isSwitchingQuality, setIsSwitchingQuality] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Check for native HLS support
    const checkNativeHlsSupport = useCallback(() => {
      const video = document.createElement("video");
      return video.canPlayType("application/vnd.apple.mpegurl") !== "";
    }, []);

    // Check for HEVC/H.265 support
    const checkHEVCSupport = useCallback(() => {
      const video = document.createElement("video");

      // Test different HEVC codec profiles
      const codecTests = [
        'video/mp4; codecs="hvc1.1.6.L93.B0"', // Main profile
        'video/mp4; codecs="hev1.1.6.L93.B0"', // Alternative format
        'video/mp4; codecs="hvc1"', // Basic
      ];

      const support = codecTests.some(
        (codec) => video.canPlayType(codec) !== ""
      );

      console.log("HEVC Support detected:", support);
      return support;
    }, []);

    // Format time helper
    const formatTime = useCallback((time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    // Format bitrate helper
    const formatBitrate = useCallback((bitrate?: number) => {
      if (!bitrate) return "";
      return ` (${Math.round(bitrate / 1000)} kbps)`;
    }, []);

    // Create quality label
    const createQualityLabel = useCallback(
      (level: { height?: number; bitrate?: number }, index: number) => {
        if (level.height) {
          return `${level.height}p${formatBitrate(level.bitrate)}`;
        }
        return `Quality ${index + 1}${formatBitrate(level.bitrate)}`;
      },
      [formatBitrate]
    );

    // Initialize HLS or native playback
    const initializePlayer = useCallback(() => {
      const video = videoRef.current;
      if (!video || !src) return;

      setError(null);
      setIsLoading(true);

      // Clean up existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const isNative = checkNativeHlsSupport();
      const hasHEVCSupport = checkHEVCSupport();
      setIsNativeHls(isNative);

      console.log("Player initialization:", {
        isNativeHLS: isNative,
        hasHEVCSupport,
        src,
      });

      if (isNative) {
        // Use native HLS support (Safari/iOS)
        video.src = src;
        setQualityLevels([]);
        setSelectedQuality(-1);
        onReady?.();
      } else if (Hls.isSupported()) {
        // Use hls.js with optimizations for H.265/HEVC
        const hls = new Hls({
          enableWorker: true,
          capLevelToPlayerSize,
          startLevel,
          lowLatencyMode,
          // Optimize for smoother quality switching, especially for H.265
          maxBufferLength: 20, // Increased for H.265 to compensate for slower decoding
          maxMaxBufferLength: 300,
          maxBufferSize: 40 * 1000 * 1000, // Larger buffer for H.265
          maxBufferHole: 0.8, // More tolerant of gaps during H.265 quality switches
          // Keep more back buffer for H.265
          backBufferLength: 15,
          // Faster fragment loading
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 4,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 4,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          // H.265 specific optimizations
          abrEwmaDefaultEstimate: 500000, // Conservative bandwidth estimate
          abrBandWidthFactor: 0.8, // More conservative for H.265
          abrBandWidthUpFactor: 0.6, // Slower quality upgrades
          // Reduce stalls during quality switches
          nudgeOffset: 0.05,
          nudgeMaxRetry: 5,
          maxFragLookUpTolerance: 0.5,
        });

        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrateKbps: Math.round(level.bitrate / 1000),
            label: createQualityLabel(level, index),
          }));

          // Sort by height desc, then bitrate desc
          levels.sort((a, b) => {
            if (a.height && b.height) {
              if (a.height !== b.height) return b.height - a.height;
              return (b.bitrateKbps || 0) - (a.bitrateKbps || 0);
            }
            return (b.bitrateKbps || 0) - (a.bitrateKbps || 0);
          });

          setQualityLevels(levels);
          setSelectedQuality(hls.currentLevel);

          // Apply initial quality preference
          if (initialQuality !== "auto") {
            if (typeof initialQuality === "object") {
              if ("levelIndex" in initialQuality) {
                const { levelIndex } = initialQuality;
                if (levelIndex >= 0 && levelIndex < hls.levels.length) {
                  hls.currentLevel = levelIndex;
                }
              } else if ("height" in initialQuality) {
                const { height } = initialQuality;
                const closestLevel =
                  levels.find((l) => l.height === height) ||
                  levels.reduce((prev, curr) => {
                    if (!prev.height || !curr.height) return prev;
                    return Math.abs(curr.height - height) <
                      Math.abs(prev.height - height)
                      ? curr
                      : prev;
                  });
                if (closestLevel) {
                  hls.currentLevel = closestLevel.index;
                }
              }
            }
          }

          onReady?.();
        });

        hls.on(Hls.Events.LEVEL_SWITCHING, () => {
          // Indicate quality switch is starting
          setIsSwitchingQuality(true);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          // Quality switch completed
          setIsSwitchingQuality(false);

          // Only update selectedQuality if we're in auto mode
          // In manual mode, it's already set by setQualityLevel
          if (hls.currentLevel === -1 || hls.autoLevelEnabled) {
            setSelectedQuality(-1);
          }
          setActualPlayingLevel(data.level);
          const level = hls.levels[data.level];
          if (level && onQualityChanged) {
            onQualityChanged({
              levelIndex: data.level,
              height: level.height,
              bitrateKbps: Math.round(level.bitrate / 1000),
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.MEDIA_ERROR:
                // Check for codec-related issues
                if (
                  data.details ===
                  Hls.ErrorDetails.MANIFEST_INCOMPATIBLE_CODECS_ERROR
                ) {
                  const hasHEVCSupport = checkHEVCSupport();
                  if (!hasHEVCSupport) {
                    setError(
                      "H.265/HEVC codec not supported. Please try a different browser with hardware acceleration enabled, or use Chrome 107+ / Edge 107+."
                    );
                  } else {
                    setError(
                      "Video codec incompatible. The video format may not be supported."
                    );
                  }
                } else if (
                  data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR
                ) {
                  setError(
                    "Video playback stalled. This may be due to insufficient hardware decoding support for H.265."
                  );
                } else {
                  // Try to recover from media errors
                  console.log("Attempting to recover from media error...");
                  hls.recoverMediaError();
                }
                break;
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError(
                  "Network error occurred. Please check your connection."
                );
                break;
              default:
                setError(
                  "A fatal error occurred during playback. This may be due to codec compatibility issues."
                );
                hls.destroy();
                break;
            }
          }

          onError?.(data);
        });
      } else {
        setError("HLS is not supported in this browser.");
        onError?.(new Error("HLS not supported"));
      }
    }, [
      src,
      capLevelToPlayerSize,
      startLevel,
      lowLatencyMode,
      initialQuality,
      onReady,
      onError,
      onQualityChanged,
      checkNativeHlsSupport,
      checkHEVCSupport,
      createQualityLabel,
    ]);

    // Setup stats reporting
    useEffect(() => {
      if (onStats && hlsRef.current) {
        const interval = setInterval(() => {
          const hls = hlsRef.current;
          const video = videoRef.current;
          if (hls && video) {
            const bandwidthKbps = hls.bandwidthEstimate
              ? Math.round(hls.bandwidthEstimate / 1000)
              : undefined;

            let bufferSec = 0;
            if (video.buffered.length > 0) {
              bufferSec =
                video.buffered.end(video.buffered.length - 1) -
                video.currentTime;
            }

            onStats({ bandwidthKbps, bufferSec });
          }
        }, 5000);

        statsIntervalRef.current = interval;
        return () => clearInterval(interval);
      }
    }, [onStats]);

    // Initialize player when src changes
    useEffect(() => {
      initializePlayer();
    }, [initializePlayer]);

    // Video event handlers
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handlePlay = () => {
        setIsPlaying(true);
        onPlay?.();
      };
      const handlePause = () => {
        setIsPlaying(false);
        onPause?.();
      };
      const handleEnded = () => {
        setIsPlaying(false);
        onEnded?.();
      };
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        // Update buffered time for progress bar
        if (video.buffered.length > 0) {
          setBufferedTime(video.buffered.end(video.buffered.length - 1));
        }
      };
      const handleDurationChange = () => setDuration(video.duration);
      const handleVolumeChange = () => {
        setVolume(video.volume);
        setIsMuted(video.muted);
      };

      video.addEventListener("loadstart", handleLoadStart);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("durationchange", handleDurationChange);
      video.addEventListener("volumechange", handleVolumeChange);

      return () => {
        video.removeEventListener("loadstart", handleLoadStart);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("durationchange", handleDurationChange);
        video.removeEventListener("volumechange", handleVolumeChange);
      };
    }, [onPlay, onPause, onEnded]);

    // Fullscreen change handler
    useEffect(() => {
      const handleFullscreenChange = () => {
        const isNowFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isNowFullscreen);

        // When entering fullscreen, show controls initially
        if (isNowFullscreen) {
          setShowControls(true);
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () =>
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
    }, []);

    // Mouse inactivity handler for fullscreen
    useEffect(() => {
      if (!isFullscreen) {
        setShowControls(true);
        return;
      }

      const handleMouseMove = () => {
        // Show controls on mouse movement
        setShowControls(true);

        // Clear existing timeout
        if (mouseInactivityTimeoutRef.current) {
          clearTimeout(mouseInactivityTimeoutRef.current);
        }

        // Hide controls after 3 seconds of inactivity
        mouseInactivityTimeoutRef.current = setTimeout(() => {
          if (isFullscreen) {
            setShowControls(false);
          }
        }, 3000);
      };

      const handleMouseLeave = () => {
        // Hide controls when mouse leaves the video area in fullscreen
        if (isFullscreen) {
          setShowControls(false);
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        // Set initial timeout
        handleMouseMove();

        return () => {
          container.removeEventListener("mousemove", handleMouseMove);
          container.removeEventListener("mouseleave", handleMouseLeave);
          if (mouseInactivityTimeoutRef.current) {
            clearTimeout(mouseInactivityTimeoutRef.current);
          }
        };
      }
    }, [isFullscreen]);

    // Control functions
    const togglePlayPause = useCallback(async () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        console.error("Play/pause error:", error);
      }
    }, []);

    const toggleMute = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
    }, []);

    const toggleFullscreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      if (!document.fullscreenElement) {
        container.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }, []);

    const seekRelative = useCallback((seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(
        0,
        Math.min(video.duration, video.currentTime + seconds)
      );
    }, []);

    const adjustVolume = useCallback((delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const newVolume = Math.max(0, Math.min(1, video.volume + delta));
      video.volume = newVolume;
      video.muted = newVolume === 0;
    }, []);

    const handleVideoClick = useCallback(
      (e: React.MouseEvent) => {
        // Prevent triggering play/pause when clicking on controls
        if ((e.target as HTMLElement).closest(".video-controls")) {
          return;
        }

        // Increment click count
        clickCountRef.current += 1;

        // Clear any existing timeout
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }

        // Wait to see if it's a double click
        clickTimeoutRef.current = setTimeout(() => {
          if (clickCountRef.current === 1) {
            // Single click - toggle play/pause
            togglePlayPause();
          } else if (clickCountRef.current === 2) {
            // Double click - toggle fullscreen
            toggleFullscreen();
          }
          // Reset click count
          clickCountRef.current = 0;
        }, 250); // Wait 250ms to distinguish between single and double click
      },
      [togglePlayPause, toggleFullscreen]
    );

    const handleKeyboardToggle = useCallback(() => {
      // Simple debounce for rapid keyboard presses
      if (isKeyboardHandledRef.current) {
        return;
      }

      // Set flag to prevent rapid key presses
      isKeyboardHandledRef.current = true;

      // Clear any existing timeout
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }

      // Execute the toggle immediately
      togglePlayPause();

      // Reset the flag after a short delay
      keyboardTimeoutRef.current = setTimeout(() => {
        isKeyboardHandledRef.current = false;
      }, 200);
    }, [togglePlayPause]);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!videoRef.current) return;

        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        // Prevent double triggering if the video element is focused
        if (target === videoRef.current) {
          videoRef.current.blur();
          return;
        }

        switch (e.code) {
          case "Space":
          case "KeyK":
            e.preventDefault();
            handleKeyboardToggle();
            break;
          case "KeyM":
            e.preventDefault();
            toggleMute();
            break;
          case "KeyF":
            e.preventDefault();
            toggleFullscreen();
            break;
          case "ArrowLeft":
            e.preventDefault();
            seekRelative(-5);
            break;
          case "ArrowRight":
            e.preventDefault();
            seekRelative(5);
            break;
          case "ArrowUp":
            e.preventDefault();
            adjustVolume(0.1); // Increase volume by 10%
            break;
          case "ArrowDown":
            e.preventDefault();
            adjustVolume(-0.1); // Decrease volume by 10%
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [
      handleKeyboardToggle,
      toggleMute,
      toggleFullscreen,
      seekRelative,
      adjustVolume,
    ]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = parseFloat(e.target.value);
    }, []);

    const handleVolumeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        video.muted = newVolume === 0;
      },
      []
    );

    const setQualityLevel = useCallback(
      (preference: QualityPreference) => {
        const hls = hlsRef.current;
        const video = videoRef.current;
        if (!hls || !video || isNativeHls) return;

        // Store current playback state
        const wasPlaying = !video.paused;
        const currentBufferInfo = hls.media?.buffered;
        const hasEnoughBuffer =
          currentBufferInfo &&
          currentBufferInfo.length > 0 &&
          currentBufferInfo.end(currentBufferInfo.length - 1) -
            video.currentTime >
            3;

        if (preference === "auto") {
          // Don't do anything if already in auto mode
          if (selectedQuality === -1) return;
          hls.currentLevel = -1;
          setSelectedQuality(-1);
        } else if (typeof preference === "object") {
          if ("levelIndex" in preference) {
            const { levelIndex } = preference;
            // Don't do anything if already manually selected at this level
            if (selectedQuality === levelIndex) return;
            if (levelIndex >= 0 && levelIndex < hls.levels.length) {
              // If switching from auto to manual at the same level that's already playing,
              // just update the UI state without changing HLS level
              if (selectedQuality === -1 && actualPlayingLevel === levelIndex) {
                setSelectedQuality(levelIndex);
              } else {
                // For H.265 content, use smoother switching strategy
                setIsSwitchingQuality(true);

                // Pre-load next level for smoother transition
                hls.nextLevel = levelIndex;

                // Wait a tick to ensure nextLevel is set, then switch
                setTimeout(() => {
                  hls.currentLevel = levelIndex;
                  setSelectedQuality(levelIndex);

                  // If we have enough buffer and was playing, keep playing smoothly
                  if (wasPlaying && hasEnoughBuffer) {
                    // Let the player continue without interruption
                    video
                      .play()
                      .catch((err) =>
                        console.error("Resume playback error:", err)
                      );
                  } else if (wasPlaying) {
                    // Wait for some buffer before resuming for smoother H.265 playback
                    const waitForBuffer = () => {
                      const newBufferInfo = hls.media?.buffered;
                      if (newBufferInfo && newBufferInfo.length > 0) {
                        const bufferAhead =
                          newBufferInfo.end(newBufferInfo.length - 1) -
                          video.currentTime;
                        if (bufferAhead > 2) {
                          video
                            .play()
                            .catch((err) =>
                              console.error("Resume playback error:", err)
                            );
                        } else {
                          setTimeout(waitForBuffer, 100);
                        }
                      }
                    };
                    waitForBuffer();
                  }
                }, 50);
              }
            }
          } else if ("height" in preference) {
            const { height } = preference;
            const level = qualityLevels.find((l) => l.height === height);
            if (level) {
              // Don't do anything if already manually selected at this level
              if (selectedQuality === level.index) return;
              // If switching from auto to manual at the same level that's already playing,
              // just update the UI state without changing HLS level
              if (
                selectedQuality === -1 &&
                actualPlayingLevel === level.index
              ) {
                setSelectedQuality(level.index);
              } else {
                // For H.265 content, use smoother switching strategy
                setIsSwitchingQuality(true);

                // Pre-load next level for smoother transition
                hls.nextLevel = level.index;

                // Wait a tick to ensure nextLevel is set, then switch
                setTimeout(() => {
                  hls.currentLevel = level.index;
                  setSelectedQuality(level.index);

                  // If we have enough buffer and was playing, keep playing smoothly
                  if (wasPlaying && hasEnoughBuffer) {
                    // Let the player continue without interruption
                    video
                      .play()
                      .catch((err) =>
                        console.error("Resume playback error:", err)
                      );
                  } else if (wasPlaying) {
                    // Wait for some buffer before resuming for smoother H.265 playback
                    const waitForBuffer = () => {
                      const newBufferInfo = hls.media?.buffered;
                      if (newBufferInfo && newBufferInfo.length > 0) {
                        const bufferAhead =
                          newBufferInfo.end(newBufferInfo.length - 1) -
                          video.currentTime;
                        if (bufferAhead > 2) {
                          video
                            .play()
                            .catch((err) =>
                              console.error("Resume playback error:", err)
                            );
                        } else {
                          setTimeout(waitForBuffer, 100);
                        }
                      }
                    };
                    waitForBuffer();
                  }
                }, 50);
              }
            }
          }
        }
      },
      [isNativeHls, qualityLevels, selectedQuality, actualPlayingLevel]
    );

    // Imperative handle
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          const video = videoRef.current;
          if (video) {
            return video.play();
          }
          return Promise.reject(new Error("Video element not available"));
        },
        pause: () => {
          const video = videoRef.current;
          if (video) {
            video.pause();
          }
        },
        toggleMute,
        setQuality: setQualityLevel,
        getCurrentLevel: () => selectedQuality,
        getLevels: () => qualityLevels,
        getVideoElement: () => videoRef.current,
      }),
      [toggleMute, setQualityLevel, selectedQuality, qualityLevels]
    );

    // Cleanup
    useEffect(() => {
      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current);
        }
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        if (keyboardTimeoutRef.current) {
          clearTimeout(keyboardTimeoutRef.current);
        }
        if (mouseInactivityTimeoutRef.current) {
          clearTimeout(mouseInactivityTimeoutRef.current);
        }
      };
    }, []);

    if (error) {
      return (
        <div
          className={cn(
            "relative rounded-lg bg-muted p-8 text-center",
            className
          )}
        >
          <div className="text-destructive text-sm font-medium mb-2">
            Playback Error
          </div>
          <div className="text-muted-foreground text-sm">{error}</div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={cn("relative group", className)}
        style={{
          position: "relative",
          cursor: isFullscreen && !showControls ? "none" : "auto",
        }}
      >
        <video
          ref={videoRef}
          className={cn("w-full h-full aspect-video", videoClassName)}
          poster={mediaURL(poster)}
          autoPlay={autoPlay}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          controls={false}
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          onKeyDown={(e) => {
            // Prevent video element from handling keyboard events
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            cursor: isFullscreen && !showControls ? "none" : "auto",
          }}
        ></video>

        {/* Click overlay for play/pause */}
        <div
          className="absolute inset-0"
          onClick={handleVideoClick}
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          style={{
            zIndex: 1,
            cursor: isFullscreen && !showControls ? "none" : "pointer",
          }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50"
            style={{ zIndex: 2 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}

        {/* Quality switching indicator */}
        {isSwitchingQuality && !isLoading && (
          <div
            className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md text-white text-sm"
            style={{ zIndex: 2 }}
          >
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
            <span>Switching quality...</span>
          </div>
        )}

        {/* Controls */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity video-controls",
            isFullscreen
              ? showControls
                ? "opacity-100"
                : "opacity-0"
              : "opacity-0 group-hover:opacity-100",
            controlsClassName
          )}
          style={{ zIndex: 3 }}
        >
          {/* Progress bar */}
          <div className="mb-3 relative">
            {/* Background track */}
            <div className="w-full h-1 bg-white/20 rounded-lg relative overflow-hidden">
              {/* Buffered progress */}
              <div
                className="absolute top-0 left-0 h-full bg-muted-foreground rounded-lg transition-all duration-300"
                style={{
                  width:
                    duration > 0 ? `${(bufferedTime / duration) * 100}%` : "0%",
                }}
              />
              {/* Current progress */}
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-lg transition-all duration-150"
                style={{
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
            </div>
            {/* Invisible input for seeking */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek video"
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/20 focus-visible:ring-white/50"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 focus-visible:ring-white/50"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Debug info */}
              {process.env.NODE_ENV === "development" && (
                <span className="text-xs text-white/50">
                  Native: {isNativeHls ? "Y" : "N"} | Levels:{" "}
                  {qualityLevels.length} | Current: {actualPlayingLevel} |
                  Selected: {selectedQuality}
                </span>
              )}

              {/* Quality selector */}
              {!isNativeHls && qualityLevels.length > 0 ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 focus-visible:ring-white/50"
                      aria-label="Quality settings"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    className="bg-black/95 border-white/20 text-white min-w-[120px]"
                    style={{ zIndex: 9999 }}
                    sideOffset={8}
                    container={containerRef.current}
                  >
                    <DropdownMenuItem
                      onSelect={() => setQualityLevel("auto")}
                      className={cn(
                        "text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer",
                        selectedQuality === -1 && "bg-white/20"
                      )}
                    >
                      Auto
                      {selectedQuality === -1 &&
                        actualPlayingLevel >= 0 &&
                        (() => {
                          const level = qualityLevels.find(
                            (l) => l.index === actualPlayingLevel
                          );
                          if (level?.height) {
                            return ` • ${level.height}p`;
                          }
                          return "";
                        })()}
                    </DropdownMenuItem>
                    {qualityLevels.map((level) => (
                      <DropdownMenuItem
                        key={level.index}
                        onSelect={() =>
                          setQualityLevel({ levelIndex: level.index })
                        }
                        className={cn(
                          "text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer",
                          selectedQuality === level.index && "bg-white/20"
                        )}
                      >
                        {level.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isNativeHls ? (
                <span className="text-sm text-white/70">Auto (system)</span>
              ) : (
                <span className="text-sm text-white/70">Loading...</span>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 focus-visible:ring-white/50"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HlsVideoPlayer.displayName = "HlsVideoPlayer";

export default HlsVideoPlayer;
