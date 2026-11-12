import { jwtVerify } from "jose";

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export function adminSigningSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, adminSigningSecret(), { algorithms: ["HS256"], requiredClaims: ["sub", "exp"] });
    // Existing administrator cookies predate the type claim. Accept their full
    // admin shape, but never a pipeline or data-room viewer credential.
    if (payload.type !== undefined && payload.type !== "admin") return null;
    if (typeof payload.sub !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(payload.sub) ||
        typeof payload.email !== "string" || !payload.email.includes("@") || typeof payload.name !== "string" ||
        typeof payload.role !== "string" || !["owner", "admin", "member"].includes(payload.role)) return null;
    return { sub: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  } catch { return null; }
}
