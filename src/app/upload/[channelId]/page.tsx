"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoUploadForm } from "@/components/features/upload/VideoUploadForm";

export default function UploadPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const channelId = useParams().channelId as string;

  // Warn before navigating away during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigating) {
        e.preventDefault();
        e.returnValue =
          "You have an upload in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isNavigating]);

  const handleUploadSuccess = ({ id: id }: { id: string }) => {
    setHasUnsavedChanges(false);
    setIsNavigating(true);

    // Show success message
    console.log("Upload completed successfully!");

    // Navigate to watch page
    router.push(`/watch/${id}`);
  };

  const handleUploadError = (message: string) => {
    setHasUnsavedChanges(false);
    console.error("Upload failed:", message);
  };

  return (
    <div className="min-h-screen bg-background rounded-xl shadow-md">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Upload Video
            </h1>
          </div>

          {/* Upload Form */}
          <VideoUploadForm
            channelId={channelId}
            allowedTypes={["video/mp4"]}
            defaultVisibility="public"
            maxSizeBytes={2 * 1024 * 1024 * 1024} // 2GB
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            className="space-y-6"
          />
        </div>
      </div>
    </div>
  );
}
