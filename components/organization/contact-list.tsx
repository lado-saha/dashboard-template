"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ContactDto,
  ContactableType,
  CreateContactRequest,
  UpdateContactRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "./forms/contact-form";
import {
  PlusCircle,
  Edit2,
  Trash2,
  Star,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactListProps {
  organizationId: string;
  contactableType: ContactableType;
}

export function ContactList({
  organizationId,
  contactableType,
}: ContactListProps) {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDto | undefined>(
    undefined
  );

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await organizationRepository.getContacts(
        contactableType,
        organizationId
      );
      setContacts(data || []);
    } catch (_error: any) {
      toast.error("Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, contactableType]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleFormSubmit = async (
    data: CreateContactRequest | UpdateContactRequest
  ) => {
    if (editingContact && editingContact.contact_id) {
      await organizationRepository.updateContact(
        contactableType,
        organizationId,
        editingContact.contact_id,
        data
      );
      toast.success("Contact updated successfully!");
    } else {
      await organizationRepository.createContact(
        contactableType,
        organizationId,
        data
      );
      toast.success("Contact added successfully!");
    }
    await fetchContacts();
    setIsFormOpen(false);
    setEditingContact(undefined);
  };

  const handleEdit = (contact: ContactDto) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = async (contactId?: string) => {
    if (!contactId || !confirm("Are you sure you want to delete this contact?"))
      return;
    try {
      await organizationRepository.deleteContactById(
        contactableType,
        organizationId,
        contactId
      );
      toast.success("Contact deleted.");
      fetchContacts();
    } catch (error)  {
      toast.error(error.message || "Failed to delete contact.");
    }
  };

  // const handleToggleFavorite = async (contact: ContactDto) => {
  //   if (!contact.contact_id) return;
  //   toast.info(`Favorite toggle for ${contact.first_name} TBD.`);
  // };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingContact(undefined)}
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
                : "Enter details for the new contact."}
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            initialData={editingContact}
            mode={editingContact ? "edit" : "create"}
            onSubmitAction={handleFormSubmit}
            onCancelAction={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No contacts found.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.contact_id}
              className="p-4 border rounded-lg flex justify-between items-start text-sm"
            >
              <div>
                <p className="font-semibold text-foreground flex items-center">
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
                <div className="space-y-1 mt-2">
                  {contact.email && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1.5" />
                      {contact.email}
                    </div>
                  )}
                  {contact.phone_number && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1.5" />
                      {contact.phone_number}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(contact)}
                  title="Edit contact"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
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
