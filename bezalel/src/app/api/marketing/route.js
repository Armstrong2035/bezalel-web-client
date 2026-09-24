import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.POYSIS_API_URL ?? "https://api.poysis.com";
const TOKEN = process.env.POYSIS_API_TOKEN ?? process.env.POYSIS_API_KEY;

const resources = {
  rules: "/marketing/rules",
  reports: "/marketing/keyword-planner/reports",
  data: "/marketing/data",
  opportunities: "/marketing/opportunities",
};

function tokenError() {
  return NextResponse.json(
    { error: "Poysis data connection is not configured." },
    { status: 503 },
  );
}

async function proxy(method, path, { body, searchParams }) {
  if (!TOKEN) return tokenError();

  const upstreamUrl = new URL(path, API_BASE_URL);
  searchParams.forEach((value, key) => {
    if (key !== "resource") upstreamUrl.searchParams.append(key, value);
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: {
        Authorization: "Bearer " + TOKEN,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      const status =
        upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status;
      return NextResponse.json(
        data ?? {
          error:
            status === 503
              ? "Poysis could not authenticate the data connection."
              : "Poysis could not load marketing data.",
        },
        { status },
      );
    }

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
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

async function handleGET(request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") ?? "rules";
  const path = resources[resource];

  if (!path) {
    return NextResponse.json({ error: "Unknown marketing resource." }, { status: 400 });
  }

  return proxy("GET", path, { searchParams });
}

export const GET = withAuth(handleGET);
