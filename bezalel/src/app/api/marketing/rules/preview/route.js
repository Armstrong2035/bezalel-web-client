import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.POYSIS_API_URL ?? "https://api.poysis.com";
const TOKEN = process.env.POYSIS_API_TOKEN ?? process.env.POYSIS_API_KEY;

async function handlePOST(request) {
  if (!TOKEN) {
    return NextResponse.json(
      { error: "Poysis data connection is not configured." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const upstreamUrl = new URL("/marketing/rules/preview", API_BASE_URL);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
              : "Poysis could not preview the rule.",
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

export const POST = withAuth(handlePOST);
