import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "./lib/admin-token";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("dcc_auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (await verifyAdminToken(token)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
