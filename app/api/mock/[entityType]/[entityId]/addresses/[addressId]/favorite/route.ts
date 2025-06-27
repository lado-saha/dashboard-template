// app/api/mock/[entityType]/[entityId]/addresses/[addressId]/favorite/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AddressableType } from '@/types/organization';

interface RouteParams {
  params: {
    entityType: AddressableType;
    entityId: string;
    addressId: string;
  };
}

export async function PUT(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entityId, entityType, addressId } = await params;
    const allAddresses = dbManager.getCollection('addresses');
    const targetAddress = allAddresses.find(addr => addr.address_id === addressId);
    if (!targetAddress || targetAddress.addressable_id !== entityId) {
      return NextResponse.json({ message: `Address with ID ${addressId} not found for this entity.` }, { status: 404 });
    }
    allAddresses.forEach(addr => {
      if (addr.addressable_id === entityId && addr.addressable_type === entityType) {
        addr.is_default = false;
      }
    });
    targetAddress.is_default = true;
    dbManager.saveCollection('addresses', allAddresses);
    const updatedAddress = dbManager.getItemById('addresses', addressId);
    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to set default address", error: error.message }, { status: 500 });
  }
}