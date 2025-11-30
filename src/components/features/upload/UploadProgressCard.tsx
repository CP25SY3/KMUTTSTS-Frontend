"use client";

import React from "react";
import { CheckCircle, XCircle, Upload, Video, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadProgressCardProps } from "@/types/video-upload";

export function UploadProgressCard({
  phase,
  uploadPct = 0,
  processPct = 0,
  errorMessage,
  onRetry,
  onView,
  className,
}: UploadProgressCardProps) {
  const getPhaseInfo = () => {
    switch (phase) {
      case "idle":
        return {
          icon: Upload,
          title: "Ready to Upload",
          description: "Select a content file to begin",
          color: "text-muted-foreground",
        };
      case "uploading":
        return {
          icon: Upload,
          title: "Uploading Content",
          description: `Uploading... ${Math.round(uploadPct)}%`,
          color: "text-blue-600",
        };
      case "processing":
        return {
          icon: Video,
          title: "Processing Content",
          description: "Converting to HLS format and generating thumbnails",
          color: "text-orange-600",
        };
      case "ready":
        return {
          icon: CheckCircle,
          title: "Upload Complete",
          description: "Your content is ready to view",
          color: "text-green-600",
        };
      case "failed":
        return {
          icon: XCircle,
          title: "Upload Failed",
          description: errorMessage || "An error occurred during upload",
          color: "text-red-600",
        };
      default:
        return {
          icon: Upload,
          title: "Ready",
          description: "",
          color: "text-muted-foreground",
        };
    }
  };

  const { icon: Icon, title, description, color } = getPhaseInfo();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {phase === "processing" ? (
            <Loader2 className={cn("h-5 w-5 animate-spin", color)} />
          ) : (
            <Icon className={cn("h-5 w-5", color)} />
          )}
          <span className={color}>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {description}
        </p>

        {/* Upload Progress */}
        {phase === "uploading" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{Math.round(uploadPct)}%</span>
            </div>
            <Progress
              value={uploadPct}
              className="h-2"
              aria-label={`Upload progress: ${Math.round(uploadPct)}%`}
              aria-valuenow={uploadPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {/* Processing Progress */}
        {phase === "processing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing Content</span>
              {processPct > 0 ? (
                <span>{Math.round(processPct)}%</span>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
            {processPct > 0 ? (
              <Progress
                value={processPct}
                className="h-2"
                aria-label={`Processing progress: ${Math.round(processPct)}%`}
                aria-valuenow={processPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            ) : (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {phase === "failed" && errorMessage && (
          <div
            className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {phase === "failed" && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Retry Upload
            </Button>
          )}

          {phase === "ready" && onView && (
            <Button onClick={onView} size="sm" className="flex-1">
              View Content
            </Button>
          )}
        </div>

        {/* Loading States */}
        {(phase === "uploading" || phase === "processing") && (
          <div className="text-xs text-muted-foreground text-center">
            Please don&apos;t close this tab while{" "}
            {phase === "uploading" ? "uploading" : "processing"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
