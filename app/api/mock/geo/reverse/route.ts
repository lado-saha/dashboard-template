import { NextResponse, NextRequest } from 'next/server';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ message: "Latitude and Longitude are required." }, { status: 400 });
  }

  const nominatimUrl = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        // Nominatim requires a specific User-Agent header for their public API
        'User-Agent': 'YowyobDashboard/1.0 (contact@yowyob.com)',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nominatim API Error:", errorText);
      return NextResponse.json({ message: "Failed to fetch address from map service." }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy to Nominatim failed:", error);
    return NextResponse.json({ message: "Internal server error proxying to map service." }, { status: 502 });
  }
}