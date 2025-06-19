// app/api/mock/contacts/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ContactDto, CreateContactRequest, ContactableType } from '@/types/organization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactableType = searchParams.get('entityType') as ContactableType | null;
    const contactableId = searchParams.get('entityId');

    if (!contactableType || !contactableId) {
      return NextResponse.json({ message: "contactableType and contactableId query params are required." }, { status: 400 });
    }
    const allContacts = dbManager.getCollection('contacts');
    const filteredContacts = allContacts.filter(c => c.contactable_type === contactableType && c.contactable_id === contactableId);
    return NextResponse.json(filteredContacts);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get contacts", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactableType = searchParams.get('entityType') as ContactableType | null;
    const contactableId = searchParams.get('entityId');
    const body = await request.json() as CreateContactRequest;

    if (!contactableType || !contactableId) {
      return NextResponse.json({ message: "contactableType and contactableId query params are required." }, { status: 400 });
    }
    if (!body.first_name && !body.last_name && !body.email && !body.phone_number) {
        return NextResponse.json({ message: "At least one contact detail is required." }, { status: 400 });
    }

    const newContactData: Omit<ContactDto, 'contact_id' | 'created_at' | 'updated_at'> = {
        ...body,
        contactable_id: contactableId,
        contactable_type: contactableType,
        is_favorite: false,
    };
    const createdContact = dbManager.addItem('contacts', newContactData);
    return NextResponse.json(createdContact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create contact", error: error.message }, { status: 500 });
  }
}