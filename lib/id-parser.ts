/**
 * A utility for temporarily embedding and extracting IDs in string fields
 * to work around backend limitations.
 */

import { OrganizationDto, BusinessActorDto } from "@/types/organization";

type TagType = "user_id" | "ba_id";

// Helper function to process DTOs after they are fetched
export function cleanOrganizationDto(org: OrganizationDto | null): OrganizationDto | null {
  if (!org) return null;
  return {
    ...org,
    business_actor_id: org.business_actor_id || (extractId(org.description, "ba_id") ?? undefined),
    description: cleanText(org.description),
  };
}

export function cleanBusinessActorDto(ba: BusinessActorDto | null): BusinessActorDto | null {
  if (!ba) return null;
  return {
    ...ba,
    user_id: ba.user_id ||( extractId(ba.biography, "user_id") ?? undefined),
    biography: cleanText(ba.biography),
  };
}

// A unique, unlikely-to-be-typed prefix and suffix for our hidden tags.
const TAG_PREFIX = "[yowyob_id:";
const TAG_SUFFIX = "]";

/**
 * Embeds a key-value pair into a text string.
 * @param text The original text (e.g., a description or biography).
 * @param key The key for the ID ('user_id' or 'ba_id').
 * @param id The ID value to embed.
 * @returns The text with the embedded ID tag.
 */
export function embedId(text: string | undefined, key: TagType, id: string): string {
  const cleanText = text ? text.split(TAG_PREFIX)[0].trim() : '';
  return `${cleanText} ${TAG_PREFIX}${key}=${id}${TAG_SUFFIX}`;
}

/**
 * Extracts an ID from a text string based on a key.
 * @param text The text containing the embedded ID.
 * @param key The key of the ID to extract.
 * @returns The extracted ID string, or null if not found.
 */
export function extractId(text: string | undefined, key: TagType): string | null {
  if (!text) return null;
  const tagStartIndex = text.indexOf(`${TAG_PREFIX}${key}=`);
  if (tagStartIndex === -1) return null;

  const valueStartIndex = tagStartIndex + TAG_PREFIX.length + key.length + 1;
  const tagEndIndex = text.indexOf(TAG_SUFFIX, valueStartIndex);
  if (tagEndIndex === -1) return null;

  return text.substring(valueStartIndex, tagEndIndex);
}

/**
 * Cleans the embedded ID tag from a string, returning only the user-visible text.
 * @param text The text containing the embedded ID.
 * @returns The cleaned text without the ID tag.
 */
export function cleanText(text: string | undefined): string {
  if (!text) return "";
  const tagStartIndex = text.indexOf(TAG_PREFIX);
  if (tagStartIndex !== -1) {
    return text.substring(0, tagStartIndex).trim();
  }
  return text;
}