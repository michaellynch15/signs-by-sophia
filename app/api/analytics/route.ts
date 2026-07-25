import { NextResponse } from "next/server";

const BASE = "https://api.vercel.com/v1/query/web-analytics";

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

async function vercelQuery(path: string, params: Record<string, string>) {
  const url = new URL(`${BASE}/${path}`);
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (projectId) url.searchParams.set("projectId", projectId);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function GET(req: Request) {
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    return NextResponse.json({ error: "not_configured" }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7");
  const since = dateStr(days);
  const until = dateStr(0);
  const trendBy = days === 1 ? "hour" : "day";

  try {
    const [countData, topPagesData, referrersData, devicesData, trendData] = await Promise.all([
      vercelQuery("visits/count", { since, until }),
      vercelQuery("visits/aggregate", { since, until, by: "route", limit: "8" }),
      vercelQuery("visits/aggregate", { since, until, by: "referrerHostname", limit: "6" }),
      vercelQuery("visits/aggregate", { since, until, by: "deviceType", limit: "5" }),
      vercelQuery("visits/aggregate", { since, until, by: trendBy }),
    ]);

    return NextResponse.json({
      pageviews: countData.data?.pageviews ?? 0,
      visitors: countData.data?.visitors ?? 0,
      topPages: topPagesData.data ?? [],
      referrers: referrersData.data ?? [],
      devices: devicesData.data ?? [],
      trend: trendData.data ?? [],
      trendBy,
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
