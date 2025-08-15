function convertOnboardingData(clientData) {
  const converted = { ...clientData };

  const experienceLevelMap = {
    "Total beginner": "beginner",
    "Some business experience": "intermediate",
    "Industry/domain expert": "domain-expert",
    "Started a business before": "expert",
  };

  const capitalMap = {
    "$0 (I'm broke but scrappy)": "0 - 100",
    "<$100": "0 - 100",
    "$100–$500": "100 - 500",
    "$500–$2,000": "1000 - 2000",
    "I'm ready to invest more if it makes sense": "10000 and above",
  };

  const timeAvailabilityMap = {
    "Just a few hours a week": "Max 5",
    "8–15 hours a week": "Max 15",
    "15–30 hours a week": "Max 30",
    "Full-time or close to it": "Fulltime",
  };

  const goalMap = {
    "Start earning from this": "Side hustle",
    "Test if it's worth pursuing": "Testing",
    "Grow into a serious business": "Full income",
    "Solve a problem I care about": "Care about",
  };

  const archetypeMap = {
    SaaS: "SaaS / Cloud Software",
    Marketplace: "Marketplace",
    "Service Business": "Service Business",
    "EdTech / Online Learning": "EdTech / Online Learning",
    "Consumer App": "Consumer Mobile App",
    "Local Business": "Local Services",
    "Newsletter / Media": "Creator / Content Engine",
    "Not sure yet": "SaaS / Cloud Software",
  };

  const journeyMap = {
    "Just an idea": "Just an idea",
    "Doing research": "Doing research",
    "Already started building": "Already started building",
    "Have some traction": "Have some traction",
    "Running a live business": "Running a live business",
  };

  const backgroundMap = {
    "Technical/Product Development": "Technical/Product Development",
    "Marketing/Growth": "Marketing/Growth",
    "Sales/Business Dev": "Sales/Business Dev",
    "Design/Creative": "Design/Creative",
    "Operations/Process": "Operations/Process",
    "Domain expertise in your industry": "Domain expertise in your industry",
    "None of the above": "None of the above",
  };

  if (converted.experienceLevel) {
    converted.experienceLevel =
      experienceLevelMap[converted.experienceLevel] || "intermediate";
  }

  if (converted.capital) {
    converted.capital = capitalMap[converted.capital] || "0 - 100";
  }

  if (converted.timeAvailability) {
    converted.timeAvailability =
      timeAvailabilityMap[converted.timeAvailability] || "Max 15";
  }

  if (converted.goal) {
    converted.goal = goalMap[converted.goal] || "Testing";
  }

  if (converted.archetype) {
    converted.archetype =
      archetypeMap[converted.archetype] || "SaaS / Cloud Software";
  }

  if (converted.journey) {
    converted.journey = journeyMap[converted.journey] || "Just an idea";
  }

  if (converted.background) {
    converted.background =
      backgroundMap[converted.background] || "None of the above";
  }

  // Journey and background don't need conversion - they match server keys

  return converted;
}

// Test with the provided example
const testData = {
  archetype: "EdTech / Online Learning",
  background: "Sales/Business Dev",
  capital: "<$100",
  experienceLevel: "Some business experience",
  goal: "Solve a problem I care about",
  idea: "I want to build a restaurant",
  journey: "Already started building",
  timeAvailability: "15–30 hours a week",
};

console.log("Original:", testData);
console.log("Converted:", convertOnboardingData(testData));

export default convertOnboardingData;
