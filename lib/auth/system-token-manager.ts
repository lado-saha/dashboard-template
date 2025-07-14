import { OAuth2TokenResponse } from "@/types/auth";
// import { yowyobApiRequest } from "../apiClient"; // Import the core request function

interface SystemToken {
  accessToken: string;
  expiresAt: number;
}


class SystemTokenManager {
  private token: SystemToken | null = null;
  private clientId = process.env.NEXT_PUBLIC_YOWYOB_AUTH_CLIENT_ID;
  private clientSecret = process.env.NEXT_PUBLIC_YOWYOB_AUTH_CLIENT_SECRET;
  private authServiceUrl = process.env.NEXT_PUBLIC_YOWYOB_AUTH_SERVICE_BASE_URL;
  private appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  private isTokenExpired(): boolean {
    return true;
    // Refresh token if it expires in the next 60 seconds.
    // return Date.now() >= this.token.expiresAt - 60 * 1000;
  }

  private async fetchNewToken(): Promise<SystemToken> {
    if (!this.clientId || !this.clientSecret || !this.authServiceUrl) {
      throw new Error("SystemTokenManager: Missing required system-level auth environment variables.");
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'manage_api read write')

    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const targetUrl = `${this.authServiceUrl}/oauth/token`;

    // This fetch goes through our app's proxy to handle CORS correctly.
    const response = await fetch(`${this.appUrl}/api/proxy/system`, {
      method: 'POST',
      headers: {
        'X-Target-URL': targetUrl,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: params,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("SystemTokenManager: Failed to fetch system token via proxy.", { status: response.status, body: errorBody });
      throw new Error(`Could not authenticate system client. Status: ${response.status}`);
    }

    const data: OAuth2TokenResponse = await response.json();

    const newToken: SystemToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    this.token = newToken;
    console.log("SystemTokenManager: New system token fetched successfully.");
    return newToken;
  }

  public async getSystemToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.fetchNewToken();
    }
    return this.token!.accessToken;
  }
}


export const systemTokenManager = new SystemTokenManager();