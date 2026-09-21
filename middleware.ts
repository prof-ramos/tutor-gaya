import { NextRequest, NextResponse } from "next/server";

// Temporary fail-closed single-user gate for the personal MVP.
// Replace with the Google OAuth allowlist specified in docs/PRD.md before inviting more users.
export function middleware(request: NextRequest) {
  const user = process.env.APP_ACCESS_USER;
  const password = process.env.APP_ACCESS_PASSWORD;
  if (!user || !password) {
    return new NextResponse("Configure APP_ACCESS_USER e APP_ACCESS_PASSWORD no servidor.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const expected = "Basic " + btoa(user + ":" + password);
  if (request.headers.get("authorization") !== expected) {
    return new NextResponse("Acesso restrito ao Tutor Gaya.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Tutor Gaya", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
