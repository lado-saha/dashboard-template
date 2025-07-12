// app/api/mock/contacts/[contactId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { UpdateContactRequest } from '@/types/organization';

export async function GET(_request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = await params;
    // Note: For GET by ID, contactable_type and contactable_id might also be needed for security/scoping in a real API.
    const contact = dbManager.getItemById('contacts', contactId);
    if (!contact) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error)  {
    return NextResponse.json({ message: "Failed to get contact", error: error.message }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = await params;
    const body = await _request.json() as UpdateContactRequest;
    const updatedContact = dbManager.updateItem('contacts', contactId, body);
    if (!updatedContact) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    return NextResponse.json(updatedContact, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to update contact", error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = await params;
    const deleted = dbManager.deleteItem('contacts', contactId);
    if (!deleted) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    return NextResponse.json({ message: "Contact deleted successfully." }, { status: 202 }); // Spec: 202 Accepted
  } catch (error)  {
    return NextResponse.json({ message: "Failed to delete contact", error: error.message }, { status: 500 });
  }
}