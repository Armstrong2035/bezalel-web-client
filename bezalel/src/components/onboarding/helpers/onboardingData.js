const onboardingQuestions = [
  {
    id: "idea",
    emoji: "💡",
    question: "What's your business idea?",
    explanation:
      "Describe your business idea in a few sentences. This helps us create a personalized business model canvas.",
    type: "text-input",
    placeholder:
      "e.g., A SaaS platform that helps small restaurants manage their inventory and reduce food waste...",
  },
  {
    id: "journey",
    emoji: "🚶‍♂️",
    question: "Where are you in the journey?",
    explanation:
      "We ask this to tailor our recommendations to your current stage. Beginners and live business owners need very different support.",
    type: "multiple-choice",
    options: [
      "Just an idea",
      "Doing research",
      "Already started building",
      "Have some traction",
      "Running a live business",
    ],
  },
  {
    id: "goal",
    emoji: "🎯",
    question: "What's your main goal?",
    explanation:
      "Your goal shapes the entire strategy. Whether you're testing or scaling, we guide you accordingly.",
    type: "multiple-choice",
    options: [
      "Start earning from this",
      "Test if it's worth pursuing",
      "Grow into a serious business",
      "Solve a problem I care about",
    ],
  },
  {
    id: "timeAvailability",
    emoji: "🕒",
    question: "How much time can you give this?",
    explanation:
      "Time is your most limited resource. We won't suggest plans that require more time than you have.",
    type: "multiple-choice",
    options: [
      "Just a few hours a week",
      "8–15 hours a week",
      "15–30 hours a week",
      "Full-time or close to it",
    ],
  },
  {
    id: "experienceLevel",
    emoji: "📚",
    question: "What's your experience level?",
    explanation:
      "This helps Bezalel know how much guidance to give. Total beginners get more hand-holding, while experts get more advanced paths.",
    type: "multiple-choice",
    options: [
      "Total beginner",
      "Some business experience",
      "Industry/domain expert",
      "Started a business before",
    ],
  },
  {
    id: "capital",
    emoji: "💰",
    question: "How much can you invest financially (for now)?",
    explanation:
      "Your financial range affects what strategies are realistic. We don't want to suggest something you can't afford.",
    type: "multiple-choice",
    options: [
      "$0 (I'm broke but scrappy)",
      "<$100",
      "$100–$500",
      "$500–$2,000",
      "I'm ready to invest more if it makes sense",
    ],
  },
  {
    id: "background",
    emoji: "🛠️",
    question: "What's your strongest skill area?",
    explanation:
      "This helps us suggest execution paths that play to your strengths",
    type: "multiple-choice",
    options: [
      "Technical/Product Development",
      "Marketing/Growth",
      "Sales/Business Dev",
      "Design/Creative",
      "Operations/Process",
      "Domain expertise in your industry",
      "None of the above",
    ],
  },
  {
    id: "archetype",
    emoji: "🧬",
    question: "What type of business is this?",
    explanation:
      "Different types of businesses require very different planning. We use this to apply proven strategy patterns from your category.",
    type: "multiple-choice",
    options: [
      "SaaS",
      "Marketplace",
      "Service Business",
      "EdTech / Online Learning",
      "Consumer App",
      "Local Business",
      "Newsletter / Media",
      "Not sure yet",
    ],
  },
];

export default onboardingQuestions;
