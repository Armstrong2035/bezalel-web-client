import { getIdeasBySegment } from "../../services/canvasSegmentService";
import {
  theProblem,
  theSolution,
  theBusinessModel,
  goToMarket,
  competitiveEdge,
  theFounders,
} from "./pitchdeckSections.js";

async function getAcceptedIdeasFromSources(userId, ...sources) {
  try {
    // Map each source to a promise that fetches its ideas
    const ideaPromises = sources.map(
      (source) => getIdeasBySegment(userId, source, true) // Set acceptedOnly to true
    );

    // Wait for all promises to resolve
    const segmentIdeas = await Promise.all(ideaPromises);

    // Flatten the array of arrays
    const allIdeas = segmentIdeas.flat();

    return allIdeas;
  } catch (error) {
    console.error("Error fetching ideas from sources:", error);
    return [];
  }
}

async function getAllPitchDeckIdeas(userId) {
  try {
    const pitchDeckData = {
      problemIdeas: await getAcceptedIdeasFromSources(
        userId,
        ...theProblem.sources
      ),
      solutionIdeas: await getAcceptedIdeasFromSources(
        userId,
        ...theSolution.sources
      ),
      businessModelIdeas: await getAcceptedIdeasFromSources(
        userId,
        ...theBusinessModel.sources
      ),
      goToMarketIdeas: await getAcceptedIdeasFromSources(
        userId,
        ...goToMarket.sources
      ),
      competitiveEdgeIdeas: await getAcceptedIdeasFromSources(
        userId,
        ...competitiveEdge.sources
      ),
      foundersIdeas: await getAcceptedIdeasFromSources(
        userId,
        ...theFounders.sources
      ),
    };

    return pitchDeckData;
  } catch (error) {
    console.error("Error gathering pitch deck ideas:", error);
    return null;
  }
}

export { getAcceptedIdeasFromSources, getAllPitchDeckIdeas };
