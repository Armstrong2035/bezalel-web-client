import { auth } from "@/firebase/serverConfig";

// Every API handler must verify identity before database access or paid work.
export function withAuth(handler) {
  return async (request, context) => {
    const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return Response.json({ error: "Sign in to continue." }, { status: 401 });
    let user;
    try {
      user = await auth.verifyIdToken(token);
    } catch {
      return Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
    }
    const claimedIds = new URL(request.url).searchParams.getAll("userId");
    if (!["GET", "HEAD"].includes(request.method)) {
      let body;
      try { body = await request.clone().json(); }
      catch { return Response.json({ error: "Invalid JSON request." }, { status: 400 }); }
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return Response.json({ error: "A request object is required." }, { status: 400 });
      }
      if (Object.hasOwn(body, "userId")) claimedIds.push(body.userId);
    }
    if (claimedIds.some(id => id !== user.uid)) {
      return Response.json({ error: "You cannot access another user's workspace." }, { status: 403 });
    }
    return handler(request, context, user);
  };
}
