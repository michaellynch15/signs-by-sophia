import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();
  if (pathname.startsWith("/dashboard/login")) return NextResponse.next();

  const auth = req.cookies.get("sbs_dash")?.value;
  if (auth !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
