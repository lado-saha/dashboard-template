// app/api/mock/[entityType]/[entityId]/addresses/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateAddressRequest, AddressableType, AddressDto } from '@/types/organization';

interface RouteParams {
  params: {
    entityType: AddressableType;
    entityId: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entityType, entityId } = await params;
    const allAddresses = dbManager.getCollection('addresses');
    const filteredAddresses = allAddresses.filter(
      addr => addr.addressable_type === entityType && addr.addressable_id === entityId
    );
    return NextResponse.json(filteredAddresses);
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to get addresses", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entityType, entityId } = await params;
    const body = await _request.json() as CreateAddressRequest;
    if (!body.address_line_1 || !body.city || !body.state || !body.zip_code || !body.country_id) {
      return NextResponse.json({ message: "Address line 1, city, state, country and zip code are required." }, { status: 400 });
    }
    const newAddressData: Omit<AddressDto, 'address_id' | 'created_at' | 'updated_at'> = {
      ...body,
      addressable_id: entityId,
      addressable_type: entityType,
      is_default: body.default || false,
    };
    const createdAddress = dbManager.addItem('addresses', newAddressData);
    return NextResponse.json(createdAddress, { status: 201 });
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to create address", error: error.message }, { status: 500 });
  }
}