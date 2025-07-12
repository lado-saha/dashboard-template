import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Gets the user ID for the current session in a mock environment.
 * It first tries to decode the NextAuth JWT from the request cookies, which is the most reliable method.
 * As a fallback, it attempts to decode a Bearer token if present.
 *
 * @param request The NextRequest object from the API route.
 * @returns The user ID string or null if not found.
 */
export async function getUserIdFromMockToken(request: NextRequest): Promise<string | null> {
  try {
    // Primary Method: Use next-auth's getToken to securely get the session token's content.
    // This is the most reliable way to get the user's session data on the server-side in a mock environment.
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (token && token.sub) {
      // The 'sub' (subject) claim in the NextAuth token is the user's ID.
      return token.sub;
    }

    // Fallback Method: If getToken fails, try to decode a Bearer token manually.
    // This might be useful if you are testing with a hardcoded token from another source.
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.split(' ')[1];
      const payloadBase64 = bearerToken.split('.')[1];
      if (payloadBase64) {
        const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payloadJson = JSON.parse(decodedPayload);
        return payloadJson.sub || payloadJson.id || null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting user ID from mock token:", error);
    return null;
  }
}