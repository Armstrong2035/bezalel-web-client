import { generateUniqueId } from "../../utils/generateId.js";

export const createCard = (data) => {
  const card = {
    id: generateUniqueId(),
    type: data.type || "default",
    content: data.content || {},
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...data.metadata,
    },
    status: data.status || "active",
  };

  return card;
};
