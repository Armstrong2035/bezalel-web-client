export const CONTEXT_FIELDS = {
  idea: "Business idea", journey: "Business stage", goal: "Goal",
  timeAvailability: "Time availability", capital: "Budget",
  experienceLevel: "Experience", background: "Background", archetype: "Business type",
};

export function validateContextChanges(changes) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("Changes must be an object.");
  const validated = {};
  for (const [key, value] of Object.entries(changes)) {
    if (!Object.hasOwn(CONTEXT_FIELDS, key) || typeof value !== "string" || value.length > 4000) {
      throw new Error("Changes must contain supported context fields with text up to 4,000 characters.");
    }
    if (key === "idea" && !value.trim()) throw new Error("The business idea cannot be empty.");
    validated[key] = value.trim();
  }
  return validated;
}
