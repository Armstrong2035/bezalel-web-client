export function getSegmentIdeas(segmentName, segments) {
  return Object.values(segments).filter(
    (segment) => segment.segment === segmentName
  );
}
