"use client";

import React, {
  useState,
  useCallback,
  ChangeEvent,
  useEffect,
  useRef,
} from "react";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadCloud, XCircle, UserCircle, Maximize } from "lucide-react"; // Removed zoom/pan icons
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageSelectedAction: (file: File | null, previewUrl: string | null) => void;
  label?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  fallbackName?: string;
  className?: string;
  imagePreviewContainerClassName?: string;
  dropzoneClassName?: string;
}

export function ImageUploader({
  currentImageUrl,
  onImageSelectedAction,
  label = "Profile Photo",
  aspectRatio = "square",
  fallbackName = "User",
  className,
  imagePreviewContainerClassName,
  dropzoneClassName,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImageUrl || null);
    if (!currentImageUrl) setFileName(null);
  }, [currentImageUrl]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Max 5MB.");
          if (event.target) event.target.value = "";
          return;
        }
        if (
          !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
            file.type
          )
        ) {
          toast.error("Invalid file type.");
          if (event.target) event.target.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setFileName(file.name);
          onImageSelectedAction(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      if (event.target) event.target.value = "";
    },
    [onImageSelectedAction]
  );

  const handleClearImage = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    setPreview(null);
    setFileName(null);
    onImageSelectedAction(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFallbackInitial = () => {
    if (!fallbackName) return "U";
    const parts = fallbackName.split(" ");
    if (parts.length === 1 && fallbackName.length > 0)
      return fallbackName.substring(0, 2).toUpperCase();
    if (parts.length > 1 && parts[0] && parts[parts.length - 1])
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return fallbackName.substring(0, 2).toUpperCase() || "P";
  };

  const handleDropzoneClick = () => {
    if (!preview && fileInputRef.current) fileInputRef.current.click();
  };

  const imageToDisplayInDialog = preview || currentImageUrl;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor="image-upload-input-trigger"
          className="text-base font-medium"
        >
          {label}
        </Label>
      )}
      <div
        className={cn(
          "relative group w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-1 flex flex-col items-center justify-center text-center transition-colors",
          "data-[has-preview=false]:hover:border-primary/70 data-[has-preview=false]:cursor-pointer",
          aspectRatio === "square" && "aspect-square max-w-xs mx-auto",
          aspectRatio === "portrait" && "aspect-[3/4] max-w-sm mx-auto",
          aspectRatio === "landscape" && "aspect-video max-w-md mx-auto",
          aspectRatio === "auto" && "min-h-[150px] max-w-md mx-auto",
          preview && "border-solid border-primary/30 p-0",
          dropzoneClassName
        )}
        onClick={handleDropzoneClick}
        data-has-preview={!!preview}
        id="image-upload-input-trigger"
      >
        <Input
          type="file"
          id="image-upload-file-input"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          aria-label={`Upload ${label}`}
        />
        {preview ? (
          <div
            className={cn(
              "relative w-full h-full",
              imagePreviewContainerClassName
            )}
          >
            <Image
              src={preview}
              alt={fileName || label || "Selected preview"}
              layout="fill"
              objectFit="contain"
              className="rounded-md"
              unoptimized
            />
            <div className="absolute top-1.5 right-1.5 z-20 flex gap-1.5">
              <Dialog open={isFullViewOpen} onOpenChange={setIsFullViewOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 opacity-80 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-background/90"
                    aria-label="View full image"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullViewOpen(true);
                    }}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-4rem)] h-[calc(100vh-4rem)] max-w-[1200px] max-h-[900px] p-2 sm:p-4 flex items-center justify-center bg-background/95 dark:bg-background/80 backdrop-blur-md border-border shadow-2xl rounded-lg">
                  <DialogHeader className="sr-only">
                    <DialogTitle>
                      {fileName || label || "Image Preview"}
                    </DialogTitle>
                    <DialogDescription>
                      Full size preview of the selected image.
                    </DialogDescription>
                  </DialogHeader>
                  {/* <DialogClose className="absolute right-3 top-3 z-50 rounded-full bg-background/50 hover:bg-accent p-1.5 text-muted-foreground hover:text-accent-foreground transition-colors">
                    <XCircle className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </DialogClose> */}
                  <div className="relative w-full h-full">
                    {imageToDisplayInDialog && (
                      <Image
                        src={imageToDisplayInDialog}
                        alt={fileName || label || "Full view"}
                        layout="fill"
                        objectFit="contain" // Key for fitting image within bounds
                        className="rounded"
                        unoptimized
                        priority
                      />
                    )}
                    {!imageToDisplayInDialog && (
                      <p className="text-muted-foreground text-center">
                        Image not available.
                      </p>
                    )}
                  </div>
                  {/* Footer with controls removed */}
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleClearImage}
                className="h-7 w-7 opacity-80 group-hover:opacity-100 transition-opacity"
                aria-label="Clear image"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload-file-input"
            className="flex flex-col items-center justify-center text-muted-foreground cursor-pointer p-4 w-full h-full"
          >
            {currentImageUrl && currentImageUrl !== "/placeholder.svg" ? (
              <Avatar
                className={cn(
                  "h-20 w-20 mb-2 border",
                  imagePreviewContainerClassName,
                  aspectRatio !== "square" && "h-24 w-24"
                )}
              >
                <AvatarImage
                  src={currentImageUrl}
                  alt={fallbackName || "Current Profile"}
                />
                <AvatarFallback className="text-3xl bg-muted">
                  {getFallbackInitial()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <UploadCloud
                className={cn(
                  "h-10 w-10 mb-2",
                  aspectRatio !== "square" && "h-12 w-12"
                )}
              />
            )}
            <p className="text-sm mt-1">
              <span className="font-semibold text-primary">
                Click to upload
              </span>{" "}
              or drag & drop
            </p>
            <p className="text-xs mt-1">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
          </label>
        )}
      </div>
      {fileName && (
        <p className="text-xs text-muted-foreground text-center mt-1">
          File: {fileName}
        </p>
      )}
    </div>
  );
}
