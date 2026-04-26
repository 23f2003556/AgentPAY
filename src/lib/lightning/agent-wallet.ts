import crypto from "crypto";
export class AgentWallet {
  private accessToken: string;
  private tokenCache: Map<string, string> = new Map();

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Call any L402-protected API, paying automatically if challenged
  async callWithPayment(url: string, options: RequestInit = {}): Promise<Response> {
    // Check token cache first
    const cached = this.tokenCache.get(url);
    if (cached) {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `L402 ${cached}`,
        },
      });
      if (res.status !== 402) return res;
      // Token expired — clear cache and retry
      this.tokenCache.delete(url);
    }

    // First attempt — will get 402 if unpaid
    const challenge = await fetch(url, options);
    
    // If it's a backend error (e.g. Alby failed to generate invoice), proactively throw
    if (challenge.status >= 400 && challenge.status !== 402) {
      const errData = await challenge.json().catch(() => ({}));
      throw new Error(errData.error || `Service returned HTTP ${challenge.status}`);
    }
    
    if (challenge.status !== 402) return challenge;

    // Parse the payment challenge
    const { paymentRequest, paymentHash } = await challenge.json();

    // Pay the invoice via Hackathon Demo Simulation (bypassing Alby)
    console.log(`💸 Agent simulating payment...`);
    
    // Simulate Alby hitting our webhook natively
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    const payload = JSON.stringify({ type: "invoice.settled", data: { payment_hash: paymentHash } });
    const sig = crypto.createHmac("sha256", process.env.MDK_WEBHOOK_SECRET || "default_webhook_secret").update(payload).digest("hex");
    
    const payRes = await fetch(`${baseUrl}/api/webhooks/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-alby-signature": `sha256=${sig}` },
      body: payload
    });

    if (!payRes.ok) throw new Error("Payment simulation failed");
    console.log(`✅ Agent simulated payment ${paymentHash.slice(0, 8)}...`);

    // Poll for token (webhook might take 1-2 seconds)
    const token = await this.waitForToken(paymentHash);
    this.tokenCache.set(url, token);

    // Retry the original request with the token
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `L402 ${token}`,
      },
    });
  }

  private async waitForToken(paymentHash: string, maxWait = 10000): Promise<string> {
    const start = Date.now();
    // Always use localhost for server-to-server calls (NEXT_PUBLIC_APP_URL is the tunnel)
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    while (Date.now() - start < maxWait) {
      const res = await fetch(`${baseUrl}/api/token/${paymentHash}`);
      const data = await res.json();
      if (data.ready) return data.token;
      await new Promise(r => setTimeout(r, 500));
    }
    throw new Error("Timeout waiting for payment confirmation");
  }
}
