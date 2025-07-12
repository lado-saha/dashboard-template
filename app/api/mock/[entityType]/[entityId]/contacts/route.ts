// app/api/mock/[entityType]/[entityId]/contacts/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { CreateContactRequest, ContactableType, ContactDto } from '@/types/organization';

interface RouteParams {
  params: {
    entityType: ContactableType; // Generic name
    entityId: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entityType, entityId } = await params;
    const allContacts = dbManager.getCollection('contacts');
    const filteredContacts = allContacts.filter(
      c => c.contactable_type === entityType && c.contactable_id === entityId
    );
    return NextResponse.json(filteredContacts);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get contacts", error: error.message }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entityType, entityId } = await params;
    const body = await _request.json() as CreateContactRequest;
    if (!body.first_name || !body.last_name) {
      return NextResponse.json({ message: "First name and last name are required." }, { status: 400 });
    }
    const newContactData: Omit<ContactDto, 'contact_id' | 'created_at' | 'updated_at'> = {
      ...body,
      contactable_id: entityId,
      contactable_type: entityType,
      is_favorite: false,
    };
    const createdContact = dbManager.addItem('contacts', newContactData);
    return NextResponse.json(createdContact, { status: 201 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to create contact", error: error.message }, { status: 500 });
  }
}