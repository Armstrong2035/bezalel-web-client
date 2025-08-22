"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";

export const useUpdateIdeaStatus = () => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateIdeaStatus = async (ideaId, accepted) => {
    if (!user) {
      console.error("User not authenticated.");
      setError("User not authenticated.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/update-option", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          ideaId,
          accepted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update idea status.");
      }

      console.log("Update successful");
    } catch (err) {
      console.error("Error updating idea status:", err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateIdeaStatus, isUpdating, error };
};
