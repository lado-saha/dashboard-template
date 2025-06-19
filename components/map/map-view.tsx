import dynamic from "next/dynamic";
import { MapSkeleton } from "./map-skeleton";
import { MapComponentProps } from "./map-component";

const DynamicMapComponent = dynamic(
  () => import("./map-component").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

// The props type is now correctly imported from the implementation file.
export function MapView(props: MapComponentProps) {
  return <DynamicMapComponent {...props} />;
}
