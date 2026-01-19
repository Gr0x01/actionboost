"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, Loader2 } from "lucide-react";
import { FileAttachment } from "@/lib/types/form";

// Re-export for convenience
export type { FileAttachment as UploadedFile } from "@/lib/types/form";

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  hint?: string;
}

const ACCEPTED_TYPES = {
  "image/*": ["image/png", "image/jpeg", "image/webp", "image/gif"],
  "application/pdf": ["application/pdf"],
};

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "image/*,application/pdf",
  label = "Upload files",
  hint = "Screenshots, PDFs, or images (max 10MB each)",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large (max ${maxSizeMB}MB)`;
    }

    // Check type
    const acceptedTypes = accept.split(",").flatMap((type) => {
      const trimmed = type.trim();
      return ACCEPTED_TYPES[trimmed as keyof typeof ACCEPTED_TYPES] || [trimmed];
    });

    if (!acceptedTypes.some((type) => file.type.match(type.replace("*", ".*")))) {
      return "File type not supported";
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<FileAttachment | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      return {
        id: data.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.url,
        path: data.path,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    }
  };

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      if (files.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setError(null);
      setIsUploading(true);

      const filesToUpload = Array.from(newFiles).slice(0, maxFiles - files.length);
      const uploadPromises = filesToUpload.map(uploadFile);
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r): r is FileAttachment => r !== null);

      if (successfulUploads.length > 0) {
        onFilesChange([...files, ...successfulUploads]);
      }

      setIsUploading(false);
    },
    [files, maxFiles, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-primary" />;
    }
    return <File className="h-5 w-5 text-cta" />;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-6
          transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/40 hover:bg-surface/50"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-sm text-muted">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-foreground">
                <span className="font-medium text-primary">Click to upload</span>{" "}
                or drag and drop
              </p>
              {hint && <p className="text-xs text-muted">{hint}</p>}
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border/60"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="p-1.5 rounded-md hover:bg-surface transition-colors"
              >
                <X className="h-4 w-4 text-muted hover:text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File count */}
      {files.length > 0 && (
        <p className="text-xs text-muted">
          {files.length} of {maxFiles} files
        </p>
      )}
    </div>
  );
}
