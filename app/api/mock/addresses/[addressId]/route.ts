// app/api/mock/addresses/[addressId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { AddressDto, UpdateAddressRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const { addressId } = await params;
    const address = dbManager.getItemById('addresses', addressId);
    if (!address) {
      return NextResponse.json({ message: `Address with ID ${addressId} not found.` }, { status: 404 });
    }
    return NextResponse.json(address);
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to get address", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const { addressId } = await params;
    const body = await _request.json() as UpdateAddressRequest;
    const updatedAddress = dbManager.updateItem('addresses', addressId, body);
    if (!updatedAddress) {
      return NextResponse.json({ message: `Address with ID ${addressId} not found.` }, { status: 404 });
    }
    return NextResponse.json(updatedAddress, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to update address", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const { addressId } = await params;
    const deleted = dbManager.deleteItem('addresses', addressId);
    if (!deleted) {
      return NextResponse.json({ message: `Address with ID ${addressId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Address deleted successfully." }, { status: 202 }); // Spec: 202 Accepted
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to delete address", error: error.message }, { status: 500 });
  }
}