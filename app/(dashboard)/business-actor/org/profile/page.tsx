import { Metadata, ResolvingMetadata } from "next";
import { OrganizationProfileClient } from "./profile-client";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// This runs on the server and generates metadata
export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
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

// This is the main page component, a Server Component by default.
// It can perform data fetching if needed, but in this case, the client component handles it.
export default function OrganizationProfilePage({ searchParams }: Props) {
  const tab =
    typeof searchParams.tab === "string" ? searchParams.tab : "edit_profile";

  // We render the client component and pass down any server-side props it might need.
  // Here, we pass the active tab from the URL search params.
  return <OrganizationProfileClient activeTab={tab} />;
}
