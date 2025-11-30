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

    // Normalize coordinate system to use css pixels.
    // ctx.scale(dpr, dpr);
    // Actually, it's often easier to just work with the scaled dimensions directly
    // or scale the context. Let's work with scaled dimensions for crisp lines.

    const render = () => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Get theme color
      // We can check the computed style of the canvas element itself
      // assuming it inherits color from parent or body
      const computedStyle = getComputedStyle(canvas);
      const themeColor = computedStyle.color || "#ffffff";

      // We want to visualize the spectrum symmetrically.
      // We'll use a subset of the buffer because the high frequencies are often empty/low energy
      // and we want the bars to look "full".
      // Let's use the first ~70% of the bins.
      const usefulBufferLength = Math.floor(bufferLength * 0.7);

      // Calculate bar width to fill the canvas
      // We want some gap.
      const gap = 2 * dpr;
      const totalGapSpace = gap * (usefulBufferLength - 1);
      const availableWidth = width - totalGapSpace;
      const barWidth = availableWidth / usefulBufferLength;

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

      for (let i = 0; i < usefulBufferLength; i++) {
        // Scale the value to fit the height
        // We want symmetric, so max height is height / 2 (top) + height / 2 (bottom)
        // But we draw from center.

        // Boost high frequencies a bit as they tend to be lower amplitude
        let value = dataArray[i];
        if (i > usefulBufferLength * 0.5) {
          value = value * 1.2;
        }

        // Normalize 0-255 to 0-1
        const percent = Math.min(1, value / 255);

        // Calculate total bar height (symmetric)
        // Max height is the full canvas height, but let's leave some padding
        const maxBarHeight = height * 0.8;
        const barHeight = Math.max(4 * dpr, percent * maxBarHeight); // Min height 4px

        const y = (height - barHeight) / 2;

        // Draw rounded rect
        // ctx.fillRect(x, y, barWidth, barHeight);
        drawRoundedRect(x, y, barWidth, barHeight, barWidth / 2);

        x += barWidth + gap;
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
