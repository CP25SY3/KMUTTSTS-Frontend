"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, FileVideo, AlertCircle, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
// import { useToast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { UploadProgressCard } from "./UploadProgressCard";
import type {
  VideoUploadFormProps,
  VideoFormData,
  ValidationErrors,
} from "@/types/video-upload";
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_SIZE_BYTES,
  DEFAULT_ALLOWED_THUMBNAIL_TYPES,
  DEFAULT_MAX_THUMBNAIL_SIZE_BYTES,
  TAG_LIMITS,
  FIELD_LIMITS,
} from "@/types/video-upload";
import { useTranscodePlayable } from "@/api/features/postContent/postContentHooks";
import { PostContentPayload } from "@/api/features/postContent/postContentType";
import { useRouter } from "next/router";

export function VideoUploadForm({
  channelId,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxThumbnailSizeBytes = DEFAULT_MAX_THUMBNAIL_SIZE_BYTES,
  allowedThumbnailTypes = DEFAULT_ALLOWED_THUMBNAIL_TYPES,
  defaultVisibility = "public",
  className,
  onSuccess,
  onError,
}: VideoUploadFormProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isThumbnailDragOver, setIsThumbnailDragOver] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "uploading" | "processing" | "ready" | "failed"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  // const [videoId, setVideoId] = useState<number | null>(null); // For future use
  const [videoSlug, setVideoSlug] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    visibility: defaultVisibility,
    tags: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const transcode = useTranscodePlayable();

  // Hooks
  // const { toast } = useToast(); // For future use
  const router = useRouter();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    };
  }, []);

  // File validation
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `File type not supported. Allowed types: ${allowedTypes
          .map((type) => type.split("/")[1])
          .join(", ")}`;
      }

      if (file.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [allowedTypes, maxSizeBytes]
  );

  // Thumbnail validation
  const validateThumbnail = useCallback(
    (file: File): string | null => {
      if (!allowedThumbnailTypes.includes(file.type)) {
        return `Thumbnail type not supported. Allowed types: ${allowedThumbnailTypes
          .map((type) => type.split("/")[1])
          .join(", ")}`;
      }

      if (file.size > maxThumbnailSizeBytes) {
        const maxSizeMB = Math.round(maxThumbnailSizeBytes / (1024 * 1024));
        return `Thumbnail too large. Maximum size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [allowedThumbnailTypes, maxThumbnailSizeBytes]
  );

  // Form validation
  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (
      formData.title.length < FIELD_LIMITS.TITLE_MIN ||
      formData.title.length > FIELD_LIMITS.TITLE_MAX
    ) {
      newErrors.title = `Title must be between ${FIELD_LIMITS.TITLE_MIN} and ${FIELD_LIMITS.TITLE_MAX} characters`;
    }

    // Description validation
    if (formData.description.length > FIELD_LIMITS.DESCRIPTION_MAX) {
      newErrors.description = `Description must be less than ${FIELD_LIMITS.DESCRIPTION_MAX} characters`;
    }

    // Tags validation
    if (formData.tags.trim()) {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      if (tags.length > TAG_LIMITS.MAX_COUNT) {
        newErrors.tags = `Maximum ${TAG_LIMITS.MAX_COUNT} tags allowed`;
      }

      for (const tag of tags) {
        if (
          tag.length < TAG_LIMITS.MIN_LENGTH ||
          tag.length > TAG_LIMITS.MAX_LENGTH
        ) {
          newErrors.tags = `Each tag must be between ${TAG_LIMITS.MIN_LENGTH} and ${TAG_LIMITS.MAX_LENGTH} characters`;
          break;
        }

        if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
          newErrors.tags =
            "Tags can only contain letters, numbers, spaces, hyphens, and underscores";
          break;
        }
      }
    }

    // File validation
    if (!selectedFile) {
      newErrors.file = "Please select a video file";
    } else {
      const fileError = validateFile(selectedFile);
      if (fileError) {
        newErrors.file = fileError;
      }
    }

    // Thumbnail validation (optional)
    if (selectedThumbnail) {
      const thumbnailError = validateThumbnail(selectedThumbnail);
      if (thumbnailError) {
        newErrors.thumbnail = thumbnailError;
      }
    }

    return newErrors;
  }, [
    formData,
    selectedFile,
    selectedThumbnail,
    validateFile,
    validateThumbnail,
  ]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, file: error }));
        return;
      }

      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));

      // Auto-fill title if empty
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
      }
    },
    [formData.title, validateFile]
  );

  // Handle thumbnail selection
  const handleThumbnailSelect = useCallback(
    (file: File) => {
      const error = validateThumbnail(file);
      if (error) {
        setErrors((prev) => ({ ...prev, thumbnail: error }));
        return;
      }

      setSelectedThumbnail(file);
      setErrors((prev) => ({ ...prev, thumbnail: undefined }));
    },
    [validateThumbnail]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Thumbnail drag and drop handlers
  const handleThumbnailDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsThumbnailDragOver(true);
  }, []);

  const handleThumbnailDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsThumbnailDragOver(false);
  }, []);

  const handleThumbnailDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsThumbnailDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleThumbnailSelect(files[0]);
      }
    },
    [handleThumbnailSelect]
  );

  // File input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Thumbnail input change
  const handleThumbnailInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleThumbnailSelect(files[0]);
      }
    },
    [handleThumbnailSelect]
  );

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Open thumbnail picker
  const openThumbnailPicker = useCallback(() => {
    thumbnailInputRef.current?.click();
  }, []);

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker]
  );

  // Form field updates
  const updateFormData = useCallback(
    (field: keyof VideoFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  // Remove selected file
  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Remove selected thumbnail
  const removeThumbnail = useCallback(() => {
    setSelectedThumbnail(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm();
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0 || !selectedFile) return;

      setIsSubmitting(true);
      setPhase("uploading");
      setUploadProgress(0);
      setProcessingProgress(0);
      setErrorMessage(null);

      try {
        // Map UI visibility -> API field
        const exclusiveTo =
          formData.visibility === "public"
            ? "public"
            : formData.visibility === "authenticated"
            ? "authenticated"
            : "staff";

        const payload: PostContentPayload = {
          file: selectedFile,
          title: formData.title,
          description: formData.description || undefined,
          type: "video",
          exclusiveTo,
          thumbnail: selectedThumbnail || undefined, // enable when backend accepts it
        };

        const res = await transcode.mutateAsync({
          payload,
          auth: true, // 👈 auto-append Bearer from localStorage ('jwt' or 'token')
          onProgress: (n) => setUploadProgress(n),
          attachRef: (xhr) => {
            xhrRef.current = xhr;
          }, // optional: allow cancel
          channelId,
        });

        if (res.ok && res.queued) {
          setPhase("processing");
          setUploadProgress(100);

          // TEMP: fake processing progress (replace with real polling when you have a status API)
          let pct = 0;
          const timer = setInterval(() => {
            pct = Math.min(95, pct + 5);
            setProcessingProgress(pct);
          }, 800);

          setTimeout(() => {
            clearInterval(timer);
            setProcessingProgress(100);
            setPhase("ready");
            onSuccess?.({ id: res.documentId });
          }, 5000);
        } else {
          throw new Error("Transcode request failed");
        }
      } catch (err) {
        let message = "Upload failed";

        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === "string") {
          message = err;
        }

        setPhase("failed");
        setErrorMessage(message);
        onError?.(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      selectedFile,
      formData,
      transcode,
      setUploadProgress,
      setProcessingProgress,
      onSuccess,
      onError,
      channelId,
      selectedThumbnail,
    ]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setPhase("idle");
    setUploadProgress(0);
    setProcessingProgress(0);
    setErrorMessage(null);
    setVideoSlug("");
  }, []);

  // Handle view video
  const handleViewVideo = useCallback(() => {
    if (channelId) {
      router.push(`/channel/${channelId}`);
    }
  }, [channelId, router]);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getAcceptAttribute = (): string => {
    return allowedTypes.join(",");
  };

  const getThumbnailAcceptAttribute = (): string => {
    return allowedThumbnailTypes.join(",");
  };

  if (phase !== "idle") {
    return (
      <div className={className}>
        <UploadProgressCard
          phase={phase}
          uploadPct={uploadProgress}
          processPct={processingProgress}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          onView={phase === "ready" ? handleViewVideo : undefined}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Select Video File</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                errors.file && "border-red-500"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFilePicker}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Drop video file here or click to select"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                Drop your video here or click to browse
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats:{" "}
                {allowedTypes
                  .map((type) => type.split("/")[1].toUpperCase())
                  .join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {formatFileSize(maxSizeBytes)}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <FileVideo className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {errors.file && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.file}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptAttribute()}
            onChange={handleFileInputChange}
            className="hidden"
            aria-hidden="true"
          />
        </CardContent>
      </Card>

      {/* Thumbnail Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedThumbnail ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isThumbnailDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                errors.thumbnail && "border-red-500"
              )}
              onDragOver={handleThumbnailDragOver}
              onDragLeave={handleThumbnailDragLeave}
              onDrop={handleThumbnailDrop}
              onClick={openThumbnailPicker}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openThumbnailPicker();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Drop thumbnail image here or click to select"
            >
              <ImageIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-medium mb-1">
                Add custom thumbnail
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Supported formats:{" "}
                {allowedThumbnailTypes
                  .map((type) => type.split("/")[1].toUpperCase())
                  .join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum size: {formatFileSize(maxThumbnailSizeBytes)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Thumbnail Preview */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-12 bg-muted rounded overflow-hidden">
                  <Image
                    src={URL.createObjectURL(selectedThumbnail)}
                    alt="Thumbnail preview"
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedThumbnail.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedThumbnail.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeThumbnail}
                  aria-label="Remove thumbnail"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {errors.thumbnail && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.thumbnail}
            </div>
          )}

          <input
            ref={thumbnailInputRef}
            type="file"
            accept={getThumbnailAcceptAttribute()}
            onChange={handleThumbnailInputChange}
            className="hidden"
            aria-hidden="true"
          />
        </CardContent>
      </Card>

      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFormData("title", e.target.value)
              }
              placeholder="Enter video title"
              maxLength={FIELD_LIMITS.TITLE_MAX}
              aria-describedby={errors.title ? "title-error" : undefined}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <div
                id="title-error"
                className="flex items-center gap-2 text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateFormData("description", e.target.value)
              }
              placeholder="Enter video description (optional)"
              maxLength={FIELD_LIMITS.DESCRIPTION_MAX}
              rows={3}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <div
                id="description-error"
                className="flex items-center gap-2 text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "public" | "authenticated" | "staff") =>
                updateFormData("visibility", value)
              }
            >
              <SelectTrigger id="visibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  Public - Anyone can find and view
                </SelectItem>
                <SelectItem value="unlisted">
                  Authenticated - Only those who login can view
                </SelectItem>
                <SelectItem value="private">
                  Staff - Only staff can view
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFormData("tags", e.target.value)
              }
              placeholder="Enter tags separated by commas (optional)"
              aria-describedby={errors.tags ? "tags-error" : "tags-help"}
              aria-invalid={!!errors.tags}
            />
            {errors.tags ? (
              <div
                id="tags-error"
                className="flex items-center gap-2 text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.tags}
              </div>
            ) : (
              <p id="tags-help" className="text-sm text-muted-foreground">
                Maximum {TAG_LIMITS.MAX_COUNT} tags, each 1-
                {TAG_LIMITS.MAX_LENGTH} characters
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || !selectedFile}
          className="flex-1"
        >
          {isSubmitting ? "Uploading..." : "Upload Video"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedFile(null);
            setSelectedThumbnail(null);
            setFormData({
              title: "",
              description: "",
              visibility: defaultVisibility,
              tags: "",
            });
            setErrors({});
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            if (thumbnailInputRef.current) {
              thumbnailInputRef.current.value = "";
            }
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
