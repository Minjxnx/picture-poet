"use client";

import type React from "react";
import { useCallback, useState } from "react";
import Image from "next/image";
import { UploadCloud, ImageIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  imageDataUri: string | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function ImageUploader({
  onImageUpload,
  imageDataUri,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (disabled) return;
      if (file) {
        if (
          !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
            file.type,
          )
        ) {
          toast({
            title: "Invalid File Type",
            description: "Please upload an image (JPEG, PNG, WEBP, GIF).",
            variant: "destructive",
          });
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: "File Too Large",
            description: `Please upload an image smaller than ${MAX_FILE_SIZE_MB}MB.`,
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImageUpload(e.target.result as string);
          }
        };
        reader.onerror = () => {
          toast({
            title: "Error Reading File",
            description: "Could not read the selected file. Please try again.",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload, toast, disabled],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleFileChange(event.dataTransfer.files[0]);
        event.dataTransfer.clearData();
      }
    },
    [handleFileChange, disabled],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [disabled],
  );

  const handleClick = () => {
    if (disabled) {
      toast({
        title: "Select Language First",
        description: "Please choose a language before uploading an image.",
        variant: "default",
      });
      return;
    }
    document.getElementById("fileInput")?.click();
  };

  return (
    <Card
      className={cn("shadow-lg", disabled && "opacity-70 pointer-events-none")}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          Upload Your Photo
        </CardTitle>
        {disabled && (
          <CardDescription className="text-sm text-destructive-foreground bg-destructive p-2 rounded-md">
            Select a language above to enable photo upload.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ease-in-out",
            isDragging
              ? "border-primary bg-accent/10"
              : "border-border hover:border-primary/70",
            imageDataUri ? "border-solid" : "",
            disabled ? "cursor-not-allowed bg-muted/50" : "cursor-pointer",
          )}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={handleClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Image upload area"
          aria-disabled={disabled}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={disabled}
          />
          {imageDataUri ? (
            <div className="relative w-full aspect-video rounded-md overflow-hidden">
              <Image
                src={imageDataUri}
                alt="Uploaded preview"
                layout="fill"
                objectFit="contain"
                data-ai-hint="uploaded photo"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
              <UploadCloud className="h-16 w-16" />
              <p className="text-lg font-semibold">
                Drag & drop your photo here
              </p>
              <p className="text-sm">or click to browse</p>
              <p className="text-xs">
                (JPEG, PNG, WEBP, GIF up to {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
          )}
        </div>
        {imageDataUri && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click the image area to upload a different photo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
