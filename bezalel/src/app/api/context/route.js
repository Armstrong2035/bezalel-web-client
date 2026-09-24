import { withAuth } from "@/app/lib/withAuth";
import { saveToMemory } from "@/app/lib/engines/decisionEngine/decisionContext";

async function handlePOST(request, context, user) {
  try {
    const onBoardData = await request.json();
    const userId = user.uid;
    const savedContext = await saveToMemory(userId, onBoardData);
    return Response.json(savedContext, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handlePOST);
