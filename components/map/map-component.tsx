"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression, Icon } from "leaflet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Expand, Shrink } from "lucide-react";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

export interface MapMarker {
  id: string | number;
  position: LatLngExpression;
  popupContent?: React.ReactNode;
  icon?: Icon;
}

export interface MapComponentProps {
  center: LatLngExpression;
  zoom: number;
  markers?: MapMarker[];
  onLocationSelectAction?: (lat: number, lng: number) => void;
  className?: string;
  isLocationPicker?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreenAction?: () => void;
}

function LocationPicker({
  onLocationSelectAction,
}: {
  onLocationSelectAction: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(error: any)  {
      onLocationSelectAction(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      animate: true,
      duration: 1.5,
    });
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [center, zoom, map]);
  return null;
}

export function MapComponent({
  center,
  zoom,
  markers = [],
  onLocationSelectAction,
  className,
  isLocationPicker = false,
  isFullscreen = false,
  onToggleFullscreenAction,
}: MapComponentProps) {
  const handleToggleFullscreen = (e: React.MouseEvent) => {
    // CRITICAL: Stop the event from bubbling up to the map click listener
    e.stopPropagation();
    if (onToggleFullscreenAction) {
      onToggleFullscreenAction();
    }
  };
  const icon = new L.Icon({
    iconUrl: "/maps/marker-icon.png",
    shadowUrl: "/maps/marker-shadow.png",
    iconSize: [22, 32],
    shadowSize: [41, 41], // size of the shadow
    iconAnchor: [22, 64], // point of the icon which will correspond to marker location
    shadowAnchor: [24, 72], // the same for the shadow
    popupAnchor: [-11, -62], // point from which the popup should open relative to the iconAnchor
  });

  return (
    // The new wrapper div that enables overlaying
    <div className={cn("relative h-full w-full", className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        // The MapContainer itself should always fill its relative parent
        className="h-full w-full z-0"
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={icon}>
            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
          </Marker>
        ))}

        {isLocationPicker && onLocationSelectAction && (
          <LocationPicker onLocationSelectAction={onLocationSelectAction} />
        )}
      </MapContainer>

      {/* The button is now a sibling to the map, overlaid with absolute positioning */}
      {onToggleFullscreenAction && (
        <div className="absolute top-3 right-3 z-[1000]">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleToggleFullscreen}
            className=" h-9 w-9"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Shrink className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
