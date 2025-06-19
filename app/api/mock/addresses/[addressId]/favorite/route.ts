// app/api/mock/addresses/[addressId]/favorite/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AddressDto } from '@/types/organization';

// Spec says GET for favorite, using PUT for mock update consistency
export async function PUT(request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const { addressId } = await params;
    const address = dbManager.getItemById('addresses', addressId);
    if (!address) {
      return NextResponse.json({ message: `Address with ID ${addressId} not found.` }, { status: 404 });
    }
    // If setting as default, unset other defaults for the same addressable
    if (!address.is_default) {
      const allAddresses = dbManager.getCollection('addresses');
      allAddresses.forEach(addr => {
        if (addr.addressable_id === address.addressable_id && addr.addressable_type === address.addressable_type) {
          addr.is_default = false;
        }
      });
      dbManager.saveCollection('addresses', allAddresses); // Save changes first
    }
    const updatedAddress = dbManager.updateItem('addresses', addressId, { is_default: !address.is_default });
    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to toggle favorite address", error: error.message }, { status: 500 });
  }
}