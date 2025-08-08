import { saveToMemory } from "@/app/lib/engines/decisionEngine/decisionContext";

export async function POST(request) {
  try {
    const onBoardData = await request.json();
    const userId = "mock-user-1710864000000"; //get user id from client.
    const savedContext = await saveToMemory(userId, onBoardData);
    return Response.json(savedContext, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
