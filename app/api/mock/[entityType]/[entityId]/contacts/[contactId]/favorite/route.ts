// app/api/mock/[entityType]/[entityId]/contacts/[contactId]/favorite/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { dbManager } from '@/lib/data-repo/local-store/json-db-manager';
import { ContactableType } from '@/types/organization';

interface RouteParams {
  params: {
    entityType: ContactableType;
    entityId: string;
    contactId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { contactId } = await params;
    const contact = dbManager.getItemById('contacts', contactId);
    if (!contact) {
      return NextResponse.json({ message: `Contact with ID ${contactId} not found.` }, { status: 404 });
    }
    const updatedContact = dbManager.updateItem('contacts', contactId, { is_favorite: !contact.is_favorite });
    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to toggle favorite contact", error: error.message }, { status: 500 });
  }
}