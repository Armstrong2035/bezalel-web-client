import { NextResponse } from "next/server";

const API_BASE_URL = process.env.POYSIS_API_URL ?? "https://api.poysis.com";

const resources = {
  rules: "/marketing/rules",
  reports: "/marketing/keyword-planner/reports",
  data: "/marketing/data",
  opportunities: "/marketing/opportunities",
};

export async function GET(request) {
  const token = process.env.POYSIS_API_TOKEN ?? process.env.POYSIS_API_KEY;
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") ?? "rules";
  const path = resources[resource];

  if (!path) {
    return NextResponse.json({ error: "Unknown marketing resource." }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json(
      { error: "Poysis data connection is not configured." },
      { status: 503 },
    );
  }

  const upstreamUrl = new URL(path, API_BASE_URL);
  searchParams.forEach((value, key) => {
    if (key !== "resource") upstreamUrl.searchParams.append(key, value);
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const status = upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status;
      return NextResponse.json(
        { error: status === 503 ? "Poysis could not authenticate the data connection." : "Poysis could not load marketing data." },
        { status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(
      { connected: true, data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "Poysis took too long to respond." : "Poysis is unavailable right now." },
      { status: 503 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
