// app/api/mock/[entityType]/[entityId]/contacts/[contactId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateContactRequest, ContactableType } from '@/types/organization';

interface RouteParams {
  params: {
    entityType: ContactableType;
    entityId: string;
    contactId: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) { /* ... GET logic ... */
  try {
    const { contactId } = await params;
    const contact = dbManager.getItemById('contacts', contactId);
    if (!contact || contact.contactable_id !== params.entityId) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found for this entity.` }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to get contact", error: error.message }, { status: 500 });
  }
}
export async function PUT(_request: NextRequest, { params }: RouteParams) { /* ... PUT logic ... */
  try {
    const { contactId } = await params;
    const body = await _request.json() as UpdateContactRequest;
    const updatedContact = dbManager.updateItem('contacts', contactId, body);
    if (!updatedContact) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    return NextResponse.json(updatedContact, { status: 202 });
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to update contact", error: error.message }, { status: 500 });
  }
}
export async function DELETE(_request: NextRequest, { params }: RouteParams) { /* ... DELETE logic ... */
  try {
    const { contactId } = await params;
    const deleted = dbManager.deleteItem('contacts', contactId);
    if (!deleted) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Contact deleted successfully." }, { status: 202 });
  } catch (error: any)  {
    return NextResponse.json({ message: "Failed to delete contact", error: error.message }, { status: 500 });
  }
}