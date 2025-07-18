"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { mediaRepository } from "@/lib/data-repo/media";
import { MediaDto } from "@/types/media";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Copy,
  Eye,
  Loader2,
} from "lucide-react";
import { FeedbackCard } from "@/components/ui/feedback-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export function MediaLibraryClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();
  const [mediaItems, setMediaItems] = useState<MediaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaDto | null>(null);

  const refreshMedia = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Fetching images associated with the organization's profile
      const logos = await mediaRepository.getMediaForResource(
        "organization",
        "image",
        "logos",
        activeOrganizationId
      );
      // In a real app, you might fetch from multiple paths (e.g., 'banners', 'gallery')
      setMediaItems(logos || []);
    } catch (error: any) {
      toast.error("Failed to load media library.", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    refreshMedia();
  }, [refreshMedia]);

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false);
    toast.success("Image uploaded successfully!");
    refreshMedia();
  };

  const handleDelete = async () => {
    if (!itemToDelete || !itemToDelete.location || !activeOrganizationId)
      return;

    // The filename is the last part of the location path
    const filename = itemToDelete.location.split("/").pop();
    if (!filename) {
      toast.error("Invalid file location, cannot delete.");
      return;
    }

    const promise = mediaRepository.deleteFile(
      "organization",
      "image",
      "logos",
      filename
    );
    toast.promise(promise, {
      loading: "Deleting image...",
      success: () => {
        setItemToDelete(null);
        refreshMedia();
        return "Image deleted successfully.";
      },
      error: (err) => `Failed to delete: ${err.message}`,
    });
  };

  const handleCopyUrl = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description={`Manage images for ${
          activeOrganizationDetails?.long_name || "your organization"
        }`}
        action={
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <FeedbackCard
          icon={ImageIcon}
          title="No Media Found"
          description="Upload your first image to get started."
          actionButton={
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <CardHeader className="p-0 relative aspect-square">
                <Image
                  src={item.location}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p
                    className="text-xs font-semibold truncate"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs opacity-80">
                    {(item.size! / 1024).toFixed(1)} KB
                  </p>
                </div>
              </CardHeader>
              <CardFooter className="p-2 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleCopyUrl(item.location)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setItemToDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ImageUploader
              onImageSelectedAction={(file) => {
                if (file && activeOrganizationId) {
                  const promise = mediaRepository.uploadFile(
                    "organization",
                    "image",
                    "logos",
                    activeOrganizationId,
                    file
                  );
                  toast.promise(promise, {
                    loading: "Uploading...",
                    success: () => {
                      handleUploadSuccess();
                      return "Upload successful!";
                    },
                    error: "Upload failed.",
                  });
                }
              }}
              label="Organization Logo or Image"
              aspectRatio="auto"
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the image "{itemToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
