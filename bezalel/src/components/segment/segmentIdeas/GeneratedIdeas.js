export default function GeneratedIdeas({ cards }) {
  return (
    <Box>
      {cards[currentCardIndex] && (
        <IdeaCard
          key={currentCardIndex}
          card={cards[currentCardIndex]}
          index={currentCardIndex}
          control={"vote"}
        />
      )}
    </Box>
  );
}
