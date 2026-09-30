import { createHash } from "node:crypto";
import { db } from "@/firebase/serverConfig";
import { listPeopleFromNotion } from "./notionService";
import { personKeys } from "./personIdentity.mjs";

// Shared by manual discovery and scheduled research for the authenticated user.
export async function researchHistory(userId) {
  const collection = db.collection("users").doc(userId).collection("researchPeople");
  const [snapshot, notion] = await Promise.all([collection.get(), listPeopleFromNotion({ all: true })]);
  return {
    existingPeople: [...snapshot.docs.map(doc => doc.data()), ...notion.people],
    async savePerson(person) {
      const keys = personKeys(person);
      const refs = keys.map(key => collection.doc(createHash("sha256").update(key).digest("hex")));
      return db.runTransaction(async transaction => {
        const docs = await Promise.all(refs.map(ref => transaction.get(ref)));
        if (docs.some(doc => doc.exists)) return false;
        for (const ref of refs) transaction.set(ref, person);
        return true;
      });
    },
  };
}
