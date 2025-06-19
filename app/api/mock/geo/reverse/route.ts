// app/api/mock/geo/reverse/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // In a more advanced mock, you could check the lat/lon and return different addresses.
  const mockAddress: any = {
    place_id: 12345,
    display_name: "Mock Address, 123 Main St, Anytown, 12345, USA",
    address: {
      road: "Main Street",
      house_number: "123",
      city: "Anytown",
      state: "CA",
      postcode: "12345",
      country_code: "us",
    },
  };
  return NextResponse.json(mockAddress);
}