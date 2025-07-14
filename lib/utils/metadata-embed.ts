// FILE: lib/utils/metadata-embed.ts

const METADATA_REGEX = /<!--\s*metadata:(\{.*\})\s*-->$/;

/**
 * Embeds a metadata object into a string by appending it as a structured HTML comment.
 * If existing metadata is found, it is replaced.
 * 
 * @param mainText The primary text content (e.g., a biography).
 * @param metadata The JSON object to embed.
 * @returns A new string with the metadata embedded at the end.
 * 
 * @example
 * embedMetadata("User bio.", { userId: "123" })
 * // Returns: "User bio.<!-- metadata:{\"userId\":\"123\"} -->"
 */
export function embedMetadata(mainText: string, metadata: Record<string, any>): string {
  // First, remove any existing metadata comment to prevent nesting.
  const cleanText = mainText.replace(METADATA_REGEX, '').trim();

  // Create the new metadata comment.
  const metadataString = JSON.stringify(metadata);
  const metadataComment = `<!-- metadata:${metadataString} -->`;

  // Return the original text concatenated with the new metadata comment.
  return `${cleanText}\n${metadataComment}`;
}

/**
 * Parses a string to extract the clean text and any embedded metadata.
 * 
 * @param textWithMetadata The string potentially containing embedded metadata.
 * @returns An object with `cleanText` and the parsed `metadata` object (or null if not found).
 * 
 * @example
 * parseMetadata("User bio.<!-- metadata:{\"userId\":\"123\"} -->")
 * // Returns: { cleanText: "User bio.", metadata: { userId: "123" } }
 */
export function parseMetadata<T extends Record<string, any>>(
  textWithMetadata: string | null | undefined
): { cleanText: string; metadata: T | null } {
  if (!textWithMetadata) {
    return { cleanText: '', metadata: null };
  }
  
  const match = textWithMetadata.match(METADATA_REGEX);

  if (match && match[1]) {
    const jsonString = match[1];
    const cleanText = textWithMetadata.replace(METADATA_REGEX, '').trim();
    try {
      const metadata = JSON.parse(jsonString) as T;
      return { cleanText, metadata };
    } catch (error) {
      console.error("Failed to parse embedded metadata:", error);
      // If parsing fails, return the text as is, without the broken comment.
      return { cleanText, metadata: null };
    }
  }

  // No metadata found, return the original text.
  return { cleanText: textWithMetadata, metadata: null };
}