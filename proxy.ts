import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const user = process.env.SITE_AUTH_USER;
  const pass = process.env.SITE_AUTH_PASS;

  // If no credentials are configured, let the request through unauthenticated.
  if (!user || !pass) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const [reqUser, reqPass] = decoded.split(":");

    if (reqUser === user && reqPass === pass) {
      return NextResponse.next();
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Site"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
