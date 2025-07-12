// app/api/mock/addresses/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AddressDto, CreateAddressRequest, AddressableType } from '@/types/organization';

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url);
    const addressableType = searchParams.get('entityType') as AddressableType | null;
    const addressableId = searchParams.get('entityId');

    if (!addressableType || !addressableId) {
      return NextResponse.json({ message: "addressableType and addressableId query params are required." }, { status: 400 });
    }
    const allAddresses = dbManager.getCollection('addresses');
    const filteredAddresses = allAddresses.filter(c => c.addressable_type === addressableType && c.addressable_id === addressableId);
    return NextResponse.json(filteredAddresses);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get addresses", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url);
    const addressableType = searchParams.get('entityType') as AddressableType | null;
    const addressableId = searchParams.get('entityId');
    const body = await _request.json() as CreateAddressRequest;

     if (!addressableType || !addressableId) {
      return NextResponse.json({ message: "addressableType and addressableId query params are required." }, { status: 400 });
    }
    if (!body.address_line_1 || !body.city || !body.state || !body.zip_code) {
        return NextResponse.json({ message: "Address line 1, city, state, and zip code are required." }, { status: 400 });
    }

    const newAddressData: Omit<AddressDto, 'address_id' | 'created_at' | 'updated_at'> = {
        ...body,
        addressable_id: addressableId,
        addressable_type: addressableType,
        is_default: false, // Default for new address
    };
    const createdAddress = dbManager.addItem('addresses', newAddressData);
    return NextResponse.json(createdAddress, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create address", error: error.message }, { status: 500 });
  }
}