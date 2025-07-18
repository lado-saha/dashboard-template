import { Metadata } from "next";
import { MediaLibraryClientPage } from "./images-client";

export const metadata: Metadata = {
  title: "Media Library",
  description: "Manage your organization's uploaded images and media files.",
};

export default async function MediaLibraryPage() {
  return <MediaLibraryClientPage />;
}
