/**
 * @file This file defines a generic server-side proxy API route.
 * @module API_Proxy
 * @description This route is designed to bypass browser CORS (Cross-Origin Resource Sharing) restrictions
 * by acting as an intermediary between the client-side application and external APIs.
 */

import { NextResponse, NextRequest } from 'next/server';

/**
 * Handles all incoming HTTP requests (GET, POST, PUT, DELETE, etc.) intended for external APIs.
 *
 * ### Motivation
 * Modern web browsers enforce a security measure known as the Same-Origin Policy, which restricts
 * web pages from making requests to a different domain than the one that served the page. For this application
 * to communicate with the remote YOWYOB APIs from the client-side, the YOWYOB servers would need to explicitly
 * permit this via CORS headers. As this external configuration cannot be guaranteed, this proxy provides a robust solution.
 * It functions by receiving a request from the client, forwarding it from the server environment (which is not subject to CORS),
 * and then streaming the external API's response back to the client.
 *
 * ### Parameters & Usage
 * It is expected that any client-side request to this proxy includes a specific HTTP header:
 * - `X-Target-URL`: This header **must** contain the full, absolute URL of the intended external API endpoint.
 *
 * The proxy transparently forwards the `Authorization` and `Content-Type` headers from the original
 * request, ensuring authentication and data formats are correctly handled.
 *
 * ### Operational Flow
 * 1.  The handler receives a request from the client to `/api/proxy/...`.
 * 2.  It extracts the destination from the `X-Target-URL` header. A 400 error is returned if this header is missing.
 * 3.  It constructs a new `fetch` request, copying the method, body, and essential headers.
 * 4.  The `duplex: 'half'` option is critically supplied to the `fetch` call to support streaming request bodies,
 *     a requirement in modern server runtimes like the one used by Next.js.
 * 5.  Upon receiving a response from the target server, it streams the status, headers, and body back to the original client.
 *     It specifically removes headers like `content-encoding` that are managed by the hosting platform to prevent conflicts.
 * 6.  If the proxy fails to reach the target server, it returns a `502 Bad Gateway` error.
 *
 * @param {NextRequest} req - The incoming request object from the Next.js framework.
 * @returns {Promise<NextResponse>} A promise that resolves to a `NextResponse` object, either streaming the
 * proxied response or returning a specific error (400 for bad request, 502 for gateway error).
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  const targetUrl = req.headers.get('X-Target-URL');

  if (!targetUrl) {
    return NextResponse.json(
      { message: 'X-Target-URL header is missing.' },
      { status: 400 }
    );
  }

  try {
    const headers = new Headers();
    headers.set('Content-Type', req.headers.get('Content-Type') || 'application/json');
    if (req.headers.has('Authorization')) {
      headers.set('Authorization', req.headers.get('Authorization')!);
    }

    const remoteResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
      redirect: 'follow',
      cache: 'no-store',
      // This option is required for streaming request bodies in modern fetch implementations.
      // @ts-expect-error - 'duplex' is a valid option in the runtime but may not be in the default TS type.
      duplex: 'half',
    });

    // Reconstruct the response headers, filtering out those that can cause issues.
    const responseHeaders = new Headers(remoteResponse.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    // Stream the remote response back to the client.
    return new NextResponse(remoteResponse.body, {
      status: remoteResponse.status,
      statusText: remoteResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[API PROXY] Error fetching ${targetUrl}:`, error);
    return NextResponse.json(
      { message: 'Proxy request failed', error: error.message },
      { status: 502 } // Bad Gateway
    );
  }
}

/**
 * Exports the single handler for all common HTTP methods.
 * This makes the proxy versatile and capable of handling any type of API request.
 */
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };