import { NextResponse, NextRequest } from 'next/server';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ message: "A search query of at least 3 characters is required." }, { status: 400 });
  }

  const nominatimUrl = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'YowyobDashboard/1.0 (contact@yowyob.com)',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nominatim API Error:", errorText);
      return NextResponse.json({ message: "Failed to search for address." }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy to Nominatim failed:", error);
    return NextResponse.json({ message: "Internal server error proxying to map service." }, { status: 502 });
  }
}