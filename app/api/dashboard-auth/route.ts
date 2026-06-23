import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("sbs_dash", process.env.DASHBOARD_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}
