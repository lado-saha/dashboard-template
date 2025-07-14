import { Metadata, ResolvingMetadata } from "next";
import { OrganizationProfileClient } from "./profile-client";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Organization Settings",
    description: "Manage your organization's profile, contacts, and addresses.",
    openGraph: {
      title: "Manage Your Organization",
      images: [...previousImages],
    },
  };
}

export default async function OrganizationProfilePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const tab =
    typeof resolvedSearchParams.tab === "string"
      ? resolvedSearchParams.tab
      : "edit_profile";

  return <OrganizationProfileClient activeTab={tab} />;
}
