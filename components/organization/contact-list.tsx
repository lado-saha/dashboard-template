"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ContactDto, ContactableType } from "@/lib/types/organization";
import { organizationApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "./contact-form"; // Assuming this path
import {
  PlusCircle,
  Edit2,
  Trash2,
  Star,
  Mail,
  PhoneForwarded,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ContactListProps {
  organizationId: string; // The ID of the parent organization or agency
  contactableType: ContactableType; // e.g., "ORGANIZATION", "AGENCY"
}

export function ContactList({
  organizationId,
  contactableType,
}: ContactListProps) {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDto | undefined>(
    undefined
  );

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      // const data = await organizationApi.getContacts(contactableType, organizationId); // REAL API CALL
      await new Promise((r) => setTimeout(r, 500)); // Mock
      const mockData: ContactDto[] = [
        {
          contact_id: "contact-1",
          first_name: "Jane",
          last_name: "Doe",
          title: "CEO",
          email: "jane.doe@example.com",
          phone_number: "555-1234",
          is_favorite: true,
        },
        {
          contact_id: "contact-2",
          first_name: "John",
          last_name: "Smith",
          title: "Sales Manager",
          email: "john.smith@example.com",
          phone_number: "555-5678",
        },
      ];
      setContacts(mockData);
    } catch (error) {
      toast.error("Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, contactableType]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleFormSuccess = (contact: ContactDto) => {
    fetchContacts(); // Refresh list
    setIsFormModalOpen(false);
    setEditingContact(undefined);
  };

  const handleEdit = (contact: ContactDto) => {
    setEditingContact(contact);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (contactId?: string) => {
    if (!contactId || !confirm("Are you sure you want to delete this contact?"))
      return;
    try {
      // await organizationApi.deleteContact(contactableType, organizationId, contactId); // REAL API CALL
      await new Promise((r) => setTimeout(r, 300)); // Mock
      toast.success("Contact deleted.");
      fetchContacts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete contact.");
    }
  };

  const handleToggleFavorite = async (contact: ContactDto) => {
    if (!contact.contact_id) return;
    // The API spec has GET for favorite, which is unusual for a state change.
    // Assuming it's a toggle or there's an update mechanism.
    toast.info(`Favorite toggle for ${contact.first_name} TBD.`);
    // await organizationApi.markContactFavorite(contactableType, organizationId, contact.contact_id);
    // fetchContacts(); // Refresh to show updated favorite status
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingContact(undefined);
              setIsFormModalOpen(true);
            }}
            className="mb-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update the details of this contact."
                : "Enter the details for the new contact."}
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            contactableId={organizationId}
            contactableType={contactableType}
            initialData={editingContact}
            mode={editingContact ? "edit" : "create"}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormModalOpen(false);
              setEditingContact(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No contacts found.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.contact_id}
              className="p-3 border rounded-md flex justify-between items-start text-sm"
            >
              <div>
                <p className="font-semibold text-foreground">
                  {contact.first_name} {contact.last_name}
                  {contact.is_favorite && (
                    <Star className="inline ml-2 h-4 w-4 text-yellow-500 fill-yellow-400" />
                  )}
                </p>
                {contact.title && (
                  <p className="text-xs text-muted-foreground">
                    {contact.title}
                  </p>
                )}
                {contact.email && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 mr-1.5" />
                    {contact.email}
                  </div>
                )}
                {contact.phone_number && (
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <PhoneForwarded className="h-3 w-3 mr-1.5" />
                    {contact.phone_number}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {!contact.is_favorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleToggleFavorite(contact)}
                    title="Mark as favorite"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(contact)}
                  title="Edit contact"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(contact.contact_id)}
                  title="Delete contact"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
