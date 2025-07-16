/**
 * @file This file defines a generic, secure server-side proxy API route.
 * @module API_Proxy
 * @description This route is designed to bypass browser CORS (Cross-Origin Resource Sharing) restrictions
 * by acting as an intermediary between the client-side application and a specific allowlist of external APIs.
 */

import { NextResponse, NextRequest } from 'next/server';

/**
 * An allowlist of trusted API hosts that this proxy is permitted to contact.
 * This is a critical security measure to prevent Server-Side Request Forgery (SSRF),
 * where an attacker could otherwise use this proxy to make requests to internal
 * network resources or other arbitrary external servers.
 */
const ALLOWED_HOSTS = [
  process.env.NEXT_PUBLIC_YOWYOB_AUTH_SERVICE_BASE_URL,
  process.env.NEXT_PUBLIC_YOWYOB_ORGANIZATION_SERVICE_BASE_URL,
  process.env.NEXT_PUBLIC_YOWYOB_MEDIA_SERVICE_BASE_URL,
].filter(Boolean); // Filter out any undefined/empty values

/**
 * A list of "hop-by-hop" headers that should not be forwarded from the remote server's
 * response back to the client. These headers are specific to the connection between
 * the proxy and the target server and are managed by the hosting platform (e.g., Vercel).
 * Forwarding them can cause issues like incorrect content encoding or connection hangs.
 */
const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'content-encoding', // Specifically managed by the environment
  'content-length',   // Will be recalculated by the final response stream
];

/**
 * Handles all incoming HTTP requests (GET, POST, PUT, DELETE, etc.) intended for external APIs.
 *
 * ### Motivation
 * Modern web browsers enforce the Same-Origin Policy, restricting web pages from making requests
 * to a different domain than the one that served the page. This proxy provides a robust solution by
 * receiving a request from the client, forwarding it from the server environment (which is not subject
 * to browser CORS), and then streaming the external API's response back to the client.
 *
 * ### Security
 * The proxy is secured via an allowlist of `ALLOWED_HOSTS`. Any request to an unlisted
 * `X-Target-URL` will be rejected with a 403 Forbidden status, preventing misuse of the proxy.
 *
 * ### Parameters & Usage
 * The client-side request to this proxy **must** include the following HTTP header:
 * - `X-Target-URL`: The full, absolute URL of the intended external API endpoint.
 *
 * The proxy transparently forwards all other relevant headers from the original request.
 *
 * ### Operational Flow
 * 1.  The handler receives a request from the client (e.g., to `/api/proxy/request`).
 * 2.  It extracts the destination URL from the `X-Target-URL` header.
 * 3.  It validates the destination URL against the `ALLOWED_HOSTS` allowlist.
 * 4.  It constructs a new `fetch` request, intelligently copying the method, body, and all relevant headers.
 * 5.  The `duplex: 'half'` option is supplied to `fetch` to support streaming request bodies, a requirement
 *     in modern server runtimes like the one used by Next.js/Vercel.
 * 6.  Upon receiving a response from the target server, it streams the status, filtered headers, and body back.
 * 7.  If any part of the process fails, it returns a relevant error (400, 403, or 502).
 *
 * @param {NextRequest} req - The incoming request object from the Next.js framework.
 * @returns {Promise<NextResponse>} A promise that resolves to a `NextResponse` object, either streaming the
 * proxied response or returning a specific error.
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  const targetUrl = req.headers.get('X-Target-URL');

  // 1. Validate that the target URL header exists.
  if (!targetUrl) {
    return NextResponse.json(
      { message: 'Request is missing the required "X-Target-URL" header.' },
      { status: 400 }
    );
  }

  // 2. CRITICAL SECURITY CHECK: Validate that the target URL is on the allowlist.
  if (!ALLOWED_HOSTS.some(host => targetUrl.startsWith(host!))) {
    console.warn(`[API PROXY] Blocked request to non-allowed host: ${targetUrl}`);
    return NextResponse.json(
      { message: `Proxying to the host "${new URL(targetUrl).hostname}" is not permitted.` },
      { status: 403 } // Forbidden
    );
  }

  try {
    // 3. Intelligently forward headers from the original request.
    // We exclude headers that are specific to the incoming connection, like 'host'.
    const headersToForward = new Headers();
    req.headers.forEach((value, key) => {
      if (!['host', 'x-forwarded-for', 'x-forwarded-proto'].includes(key.toLowerCase())) {
        headersToForward.set(key, value);
      }
    });

    // 4. Make the proxied request to the target API.
    const remoteResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headersToForward,
      body: req.body, // The request body is streamed directly.
      redirect: 'follow',
      cache: 'no-store',
      // This option is required for streaming request bodies in modern fetch implementations.
      // @ts-expect-error - 'duplex' is a valid option in the runtime but may not be in the default TS type.
      duplex: 'half',
    });

    // 5. Reconstruct the response headers, filtering out hop-by-hop headers.
    const responseHeaders = new Headers();
    remoteResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    
    // 6. Stream the remote response back to the original client.
    return new NextResponse(remoteResponse.body, {
      status: remoteResponse.status,
      statusText: remoteResponse.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    // 7. Handle network errors or failures to connect to the target server.
    console.error(`[API PROXY] Error forwarding request to ${targetUrl}:`, error);
    return NextResponse.json(
      { message: 'Proxy request failed to reach the target server.', error: (error as Error).message },
      { status: 502 } // Bad Gateway
    );
  }
}

/**
 * Exports the single handler for all common HTTP methods.
 * This makes the proxy versatile and capable of handling any type of API request.
 */
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };