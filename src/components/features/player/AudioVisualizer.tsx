"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
}

export function AudioVisualizer({
  analyser,
  isPlaying,
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Handle Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const render = () => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const computedStyle = getComputedStyle(canvas);
      const themeColor = computedStyle.color || "#ffffff";

      const bars = 64; // Fixed number of bars
      const barWidth = width / bars;
      const gap = 2 * dpr;
      const effectiveBarWidth = barWidth - gap;

      let x = 0;

      ctx.fillStyle = themeColor;

      // Rounded caps helper
      const drawRoundedRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
      ) => {
        if (h < radius * 2) radius = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      };

      // Logarithmic mapping
      for (let i = 0; i < bars; i++) {
        const minBin = 1;
        const maxBin = Math.floor(bufferLength * 0.70);

        const startBin = Math.floor(
          minBin * Math.pow(maxBin / minBin, i / bars)
        );
        const endBin = Math.floor(
          minBin * Math.pow(maxBin / minBin, (i + 1) / bars)
        );

        const actualEndBin = Math.max(endBin, startBin + 1);

        let sum = 0;
        let count = 0;
        for (let j = startBin; j < actualEndBin && j < bufferLength; j++) {
          sum += dataArray[j];
          count++;
        }

        let value = count > 0 ? sum / count : 0;

        const normalizedIndex = i / bars;
        let boost = 1.0;

        if (normalizedIndex < 0.2) {
          boost = 0.85;
        } else if (normalizedIndex < 0.4) {
          boost = 0.9;
        } else if (normalizedIndex < 0.6) {
          boost = 1.05;
        } else if (normalizedIndex < 0.8) {
          boost = 1.4;
        } else {
          boost = 1.45;
        }

        value = value * boost;

        let percent = value / 255;
        percent = Math.pow(percent, 1.5);

        percent = Math.min(1, percent);
        percent = Math.min(1, percent);

        const maxBarHeight = height * 0.85;
        const barHeight = Math.max(4 * dpr, percent * maxBarHeight); // Min height 4px

        const y = (height - barHeight) / 2;

        drawRoundedRect(
          x,
          y,
          effectiveBarWidth,
          barHeight,
          effectiveBarWidth / 2
        );

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    if (isPlaying) {
      render();
    } else {
      cancelAnimationFrame(animationFrameRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a flat line (silence)
      const width = canvas.width;
      const height = canvas.height;
      const computedStyle = getComputedStyle(canvas);
      ctx.fillStyle = computedStyle.color || "#ffffff";
      ctx.globalAlpha = 0.3;

      const barHeight = 4 * dpr;
      const y = (height - barHeight) / 2;
      const gap = 2 * dpr;
      // Draw static bars
      const usefulBufferLength = 64; // arbitrary for static look
      const totalGapSpace = gap * (usefulBufferLength - 1);
      const availableWidth = width - totalGapSpace;
      const barWidth = availableWidth / usefulBufferLength;

      let x = 0;
      for (let i = 0; i < usefulBufferLength; i++) {
        // ctx.fillRect(x, y, barWidth, barHeight);
        // Rounded caps helper
        const drawRoundedRect = (
          x: number,
          y: number,
          w: number,
          h: number,
          radius: number
        ) => {
          if (h < radius * 2) radius = h / 2;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        };
        drawRoundedRect(x, y, barWidth, barHeight, barWidth / 2);
        x += barWidth + gap;
      }
      ctx.globalAlpha = 1.0;
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, analyser]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
