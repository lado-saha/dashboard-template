import { NextRequest } from 'next/server';

/**
 * Decodes a JWT from the Authorization header to extract the user ID ('sub' claim).
 * This is for MOCKING PURPOSES ONLY and does not verify the token's signature.
 * @param request The NextRequest object from the API route.
 * @returns The user ID string or null if not found.
 */
export function getUserIdFromMockToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      return null;
    }

    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payloadJson = JSON.parse(decodedPayload);

    // The 'sub' (subject) claim in a standard JWT holds the user ID.
    return payloadJson.sub || null;
  } catch (error) {
    console.error("Error decoding mock token:", error);
    return null;
  }
}