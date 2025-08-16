import { updateIdeaStatus } from "@/app/lib/services/canvasSegmentService";

export async function PATCH(request) {
  try {
    const { canvasId, segment, status } = await request.json();

    if (!canvasId || !segment || !optionId) {
      return Response.json(
        {
          error: "canvasId, segment, and optionId are required",
        },
        { status: 400 }
      );
    }

    if (!status || !["accepted", "rejected"].includes(status)) {
      return Response.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    const updatedCanvas = await updateOptionStatus(
      canvasId,
      segment,
      optionId,
      status
    );

    return Response.json(updatedCanvas);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
