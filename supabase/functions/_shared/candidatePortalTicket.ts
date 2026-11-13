// Portable candidate portal proof-of-email ticket helpers.
// Web Crypto is available in Supabase Deno Edge Functions and Node 20+ test runs.
export interface CandidatePortalTicket {
  email: string;
  trackingCode: string | null;
  expiresAt: number;
}

export const PORTAL_TOKEN_TTL_MS = 15 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[a-zA-Z0-9_-]+$/.test(value) || value.length > 2048) {
    throw new Error("Invalid portal ticket encoding");
  }
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

export async function getCandidatePortalTicketKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) {
    throw new Error("CANDIDATE_PORTAL_SIGNING_SECRET must contain at least 32 characters");
  }
  const keyBytes = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode("tawzeefx:candidate-portal:v1:" + secret),
  );
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function issueCandidatePortalTicket(
  ticket: CandidatePortalTicket,
  key: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(ticket)),
  );
  const bytes = new Uint8Array(iv.byteLength + encrypted.byteLength);
  bytes.set(iv, 0);
  bytes.set(new Uint8Array(encrypted), iv.byteLength);
  return toBase64Url(bytes);
}

export async function validateCandidatePortalTicket(
  rawToken: unknown,
  key: CryptoKey,
  now = Date.now(),
): Promise<CandidatePortalTicket | null> {
  if (typeof rawToken !== "string" || rawToken.length < 40 || rawToken.length > 2048) {
    return null;
  }
  try {
    const bytes = fromBase64Url(rawToken);
    if (bytes.byteLength < 29) return null;
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(0, 12) },
      key,
      bytes.slice(12),
    );
    const payload: unknown = JSON.parse(decoder.decode(plaintext));
    if (!payload || typeof payload !== "object") return null;
    const ticket = payload as Partial<CandidatePortalTicket>;
    if (
      typeof ticket.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticket.email) ||
      (ticket.trackingCode !== null && typeof ticket.trackingCode !== "string") ||
      typeof ticket.expiresAt !== "number" ||
      !Number.isFinite(ticket.expiresAt) ||
      ticket.expiresAt <= now ||
      ticket.expiresAt > now + PORTAL_TOKEN_TTL_MS
    ) return null;
    return ticket as CandidatePortalTicket;
  } catch {
    return null;
  }
}
