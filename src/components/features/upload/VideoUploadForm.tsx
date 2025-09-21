"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, FileVideo, AlertCircle } from "lucide-react";
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
  StrapiUploadResponse,
  StrapiVideoResponse,
} from "@/types/video-upload";
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_SIZE_BYTES,
  POLLING_INTERVAL_MS,
  POLLING_TIMEOUT_MS,
  TAG_LIMITS,
  FIELD_LIMITS,
} from "@/types/video-upload";

export function VideoUploadForm({
  strapiBaseUrl,
  authToken,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  defaultVisibility = "unlisted",
  className,
  onSuccess,
  onError,
}: VideoUploadFormProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Hooks
  // const { toast } = useToast(); // For future use

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

    return newErrors;
  }, [formData, selectedFile, validateFile]);

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

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
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

  // Upload to Strapi
  const uploadToStrapi = useCallback((): Promise<StrapiUploadResponse> => {
    return new Promise((resolve, reject) => {
      if (!selectedFile) {
        reject(new Error("No file selected"));
        return;
      }

      const formData = new FormData();
      formData.append("files", selectedFile);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload"));
      };

      const headers: Record<string, string> = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      xhr.open("POST", `${strapiBaseUrl}/api/upload`);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }, [selectedFile, strapiBaseUrl, authToken]);

  // Create video in Strapi
  const createVideo = useCallback(
    async (fileId: number): Promise<StrapiVideoResponse> => {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const payload = {
        data: {
          title: formData.title,
          description: formData.description || undefined,
          visibility: formData.visibility,
          tags,
          status: "queued" as const,
          source: fileId,
        },
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${strapiBaseUrl}/api/videos`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create video: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    },
    [formData, strapiBaseUrl, authToken]
  );

  // Poll video status
  const pollVideoStatus = useCallback(
    (id: number) => {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const headers: Record<string, string> = {};
          if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
          }

          const response = await fetch(
            `${strapiBaseUrl}/api/videos/${id}?populate=*`,
            {
              headers,
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch video status");
          }

          const data: StrapiVideoResponse = await response.json();
          const {
            status,
            slug,
            errorMessage: apiErrorMessage,
          } = data.data.attributes;

          if (status === "ready") {
            setPhase("ready");
            setVideoSlug(slug || "");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
            }
            onSuccess?.({ id, slug: slug || "" });
            return;
          }

          if (status === "failed") {
            setPhase("failed");
            setErrorMessage(apiErrorMessage || "Processing failed");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
            }
            return;
          }

          // Update processing progress if available
          setProcessingProgress((prev) => Math.min(prev + 5, 95)); // Simulate progress
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, POLLING_INTERVAL_MS);

      // Timeout after 10 minutes
      pollingTimeoutRef.current = setTimeout(() => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setPhase("failed");
        setErrorMessage(
          "Processing timeout. Please contact support if this persists."
        );
      }, POLLING_TIMEOUT_MS);
    },
    [strapiBaseUrl, authToken, onSuccess]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      setPhase("uploading");
      setUploadProgress(0);
      setProcessingProgress(0);
      setErrorMessage(null);

      try {
        // Step 1: Upload file
        const uploadResponse = await uploadToStrapi();
        if (!uploadResponse || uploadResponse.length === 0) {
          throw new Error("No file uploaded");
        }

        setPhase("processing");
        setUploadProgress(100);

        // Step 2: Create video entry
        const fileId = uploadResponse[0].id;
        const videoResponse = await createVideo(fileId);

        const { id } = videoResponse.data;
        // setVideoId(id); // For future use

        // Step 3: Start polling for status
        pollVideoStatus(id);
      } catch (error) {
        console.error("Upload error:", error);
        setPhase("failed");
        setErrorMessage(
          error instanceof Error ? error.message : "Upload failed"
        );
        onError?.(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, uploadToStrapi, createVideo, pollVideoStatus, onError]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setPhase("idle");
    setUploadProgress(0);
    setProcessingProgress(0);
    setErrorMessage(null);
    // setVideoId(null); // For future use
    setVideoSlug("");
  }, []);

  // Handle view video
  const handleViewVideo = useCallback(() => {
    if (videoSlug) {
      window.location.href = `/watch/${videoSlug}`;
    }
  }, [videoSlug]);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getAcceptAttribute = (): string => {
    return allowedTypes.join(",");
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
              onValueChange={(value: "public" | "unlisted" | "private") =>
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
                  Unlisted - Only those with link can view
                </SelectItem>
                <SelectItem value="private">
                  Private - Only you can view
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
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
