"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import type { FileAttachment } from "@/lib/types/form";

interface UploadInputProps {
  value: FileAttachment[];
  onChange: (v: FileAttachment[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function UploadInput({ value, onChange, onSubmit, onSkip, onBack }: UploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    if (value.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only images, PDFs, and spreadsheets allowed");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Files must be under ${MAX_SIZE_MB}MB`);
        return;
      }
    }

    setError(null);
    setIsUploading(true);

    try {
      const uploaded: FileAttachment[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        uploaded.push({
          id: data.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: data.url,
          path: data.path,
        });
      }

      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [value, onChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, [processFiles]);

  const removeFile = (id: string) => {
    onChange(value.filter((f) => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-xl p-3 border-2 border-foreground/20 bg-background"
            >
              <div className="text-foreground/50">{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-foreground/50 font-mono">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < MAX_FILES && (
        <label
          className="block cursor-pointer"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-cta bg-cta/5"
              : "border-foreground/30 hover:border-foreground"
          }`}>
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-cta animate-spin" />
                <p className="text-sm text-foreground/60 font-mono">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-foreground/40" />
                <p className="text-sm text-foreground">
                  Drop files here or <span className="font-bold text-cta">browse</span>
                </p>
                <p className="text-xs text-foreground/50 font-mono">
                  Screenshots, analytics, spreadsheets (max {MAX_SIZE_MB}MB)
                </p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}

      {error && <p className="text-sm text-red-500 text-center font-bold">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {value.length === 0 && (
            <button
              onClick={onSkip}
              className="rounded-xl px-4 py-2 border-2 border-foreground/30 text-sm font-bold text-foreground/60 hover:border-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={value.length > 0 ? onSubmit : onSkip}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 bg-cta text-white text-sm font-bold border-2 border-cta shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
