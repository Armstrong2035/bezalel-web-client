export default function SegmentSignals({ cards }) {
  return (
    <Box>
      {cards.map((card, index) => (
        <IdeaCard key={index} card={card} index={index} control={"signal"} />
      ))}
    </Box>
  );
}
