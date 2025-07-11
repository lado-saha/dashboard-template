// app/api/mock/contacts/[contactId]/favorite/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
// import { ContactDto } from '@/types/organization';

// Spec says GET for favorite, which is unusual for a state change.
export async function PUT(_request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { contactId } = await params;
    const contact = dbManager.getItemById('contacts', contactId);
    if (!contact) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    const updatedContact = dbManager.updateItem('contacts', contactId, { is_favorite: !contact.is_favorite });
    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error)  {
    return NextResponse.json({ message: "Failed to toggle favorite contact", error: error.message }, { status: 500 });
  }
}