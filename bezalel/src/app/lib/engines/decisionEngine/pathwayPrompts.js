// ISSUES FOUND:
// 1. 'journey' field is collected but not handled in server prompts
// 2. 'background' field is collected but not handled in server prompts
// 3. Some client archetype options don't map to server archetypes
// 4. Capital range mismatch: client has "$500–$2,000" but server jumps from "500-1000" to "1000-5000"

// UPDATED PATHWAY PROMPTS:

const levels = {
  beginner:
    "Use simple language and explain business concepts clearly. Break complex ideas into step-by-step approaches. Define key terms and provide context for why strategies matter. Focus on proven, low-risk methods with clear implementation paths.",

  intermediate:
    "Use standard business terminology and assume familiarity with basic concepts. You can suggest multi-step strategies and discuss trade-offs between different approaches. Include strategic reasoning behind tactical recommendations.",

  expert:
    "Assume deep business knowledge and focus on sophisticated strategies. Emphasize competitive advantages, advanced optimization techniques, and nuanced approaches. You can discuss high-risk/high-reward scenarios and when to break conventional rules.",

  "domain-expert":
    "Leverage their industry expertise while filling business knowledge gaps. Help translate their domain knowledge into commercial advantages. Focus on business models, go-to-market strategies, and operational scaling specific to their area of expertise.",
};

const capitalOptions = {
  "0 - 100":
    "Focus exclusively on zero-cost strategies and revenue-first approaches. Every recommendation should use free tools, organic methods, or generate income before requiring investment. Emphasize resourcefulness and bootstrapping.",

  "100 - 500":
    "Suggest low-cost validation methods and minimal investments with quick ROI potential. Include specific affordable tools and small-scale testing approaches. Prioritize learning over scaling.",

  "500 - 1000":
    "Balance basic professional setup with smart validation. Include essential tools and minimal branding investments while maintaining lean approach until validation.",

  "1000 - 2000":
    "Include moderate investments in tools, marketing tests, and initial setup. Recommend strategies that can accelerate learning and early traction with measured financial risk.",

  "2000 - 5000":
    "Suggest comprehensive tooling and significant marketing investments. Include part-time hiring and substantial setup costs while maintaining sustainable cash flow focus.",

  "5000 - 10000":
    "Include premium tools, large marketing initiatives, and team investments. Focus on strategies that can scale quickly with proper capital deployment.",

  "10000 and above":
    "Recommend aggressive growth strategies including enterprise tools, major marketing campaigns, and substantial team building. Emphasize competitive advantages through strategic investment.",
};

const timeAvailabilities = {
  "Max 5":
    "Prioritize highly automated and low-maintenance strategies. Recommend batch work approaches, outsourcing options, and passive income models. Focus on high-impact activities that require minimal ongoing management.",

  "Max 15":
    "Balance automated systems with hands-on activities. Include efficient processes and tools that maximize output per hour. Suggest time-effective marketing and development approaches.",

  "Max 30":
    "Include more hands-on strategies like active marketing, regular content creation, and direct customer engagement. Focus on sustainable approaches that can grow with consistent time investment.",

  Fulltime:
    "Recommend comprehensive strategies including extensive content creation, active sales, complex product development, and hands-on customer acquisition. Focus on rapid growth and scaling opportunities.",
};

const goals = {
  "Side hustle":
    "Focus on predictable, scalable revenue streams that won't interfere with other commitments. Emphasize sustainable, low-stress approaches with realistic income expectations.",

  "Full income":
    "Prioritize scalable revenue models with significant income potential. Include aggressive growth tactics and multiple revenue streams that can reach $50K+ annually.",

  Testing:
    "Focus on rapid, low-cost validation methods like MVPs, landing page tests, pre-sales, and market research. Emphasize learning and data collection over immediate revenue generation.",

  Improve:
    "Focus on optimization strategies, efficiency improvements, new revenue streams, and competitive advantages. Analyze performance gaps and scaling opportunities for existing business.",

  "Care about":
    "Balance impact with sustainability. Focus on customer value, long-term vision, and strategies that align profit with purpose. Emphasize authentic brand building and mission-driven approaches.",
};

const archetypes = {
  "SaaS / Cloud Software":
    "Focus on recurring revenue models, user retention strategies, and scalable infrastructure. For beginners, emphasize no-code/low-code solutions. For experts, focus on technical differentiation and enterprise features.",

  "E-commerce / D2C":
    "Emphasize product sourcing, inventory management, conversion optimization, and fulfillment logistics. Focus on brand building, customer acquisition costs, and profit margins per unit.",

  Marketplace:
    "Address the two-sided platform challenge with strategies for network effects, chicken-and-egg problem solving, transaction facilitation, and trust systems. Focus on scaling both supply and demand simultaneously.",

  "Local Services":
    "Emphasize local SEO, community networking, referral systems, and service delivery optimization. Focus on reputation management and capacity scaling within geographic constraints.",

  "Service Business":
    "Focus on expertise positioning, client acquisition, service packaging, and pricing strategies. Emphasize scaling through systems, processes, and team building rather than personal time.",

  "Creator / Content Engine":
    "Focus on audience building, content consistency, and multiple monetization streams including ads, sponsorships, products, and memberships. Emphasize community engagement and platform diversification.",

  "Subscription Box / Membership":
    "Focus on customer retention, churn reduction, and supply chain management. Emphasize creating ongoing value that justifies recurring payments and building strong community.",

  "Consumer Mobile App":
    "Focus on user acquisition, app store optimization, engagement metrics, and monetization strategies including freemium models, ads, and in-app purchases. Emphasize retention and viral growth tactics.",

  "EdTech / Online Learning":
    "Focus on curriculum development, student engagement, learning outcomes, and certification value. Emphasize authority building, scalable delivery methods, and measurable student success.",
};

const journeyStages = {
  "Just an idea":
    "Focus on idea validation, market research, and customer discovery. Prioritize risk-free exploration methods and talking to potential customers over building. Emphasize learning and conviction-building.",

  "Doing research":
    "Emphasize systematic validation methods, competitive analysis, and customer interviews. Help bridge research findings into actionable next steps and early prototyping decisions.",

  "Already started building":
    "Focus on MVP completion, early user feedback loops, and iteration strategies. Balance continued development with customer development and prepare for launch activities.",

  "Have some traction":
    "Emphasize growth strategies, optimization of what's working, and scaling systems. Focus on amplifying successful elements and expanding market reach.",

  "Running a live business":
    "Focus on optimization, operational efficiency, new revenue streams, and competitive positioning. Treat as business improvement rather than startup validation.",
};

const backgroundStrengths = {
  "Technical/Product Development":
    "Leverage their building abilities while emphasizing customer development, marketing, and business model validation. Suggest technical solutions and development-first approaches where appropriate.",

  "Marketing/Growth":
    "Leverage their customer acquisition skills while ensuring they don't skip product-market fit validation. Focus on growth strategies and marketing channels they can execute effectively.",

  "Sales/Business Dev":
    "Leverage their relationship-building and revenue generation abilities. Emphasize direct customer engagement, partnership strategies, and revenue-focused validation approaches.",

  "Design/Creative":
    "Leverage their design and creative abilities for brand building, user experience, and creative marketing. Balance aesthetic focus with functionality and customer needs validation.",

  "Operations/Process":
    "Leverage their systematic thinking and efficiency focus. Emphasize systematic approaches, process optimization, and scalable operational strategies.",

  "Domain expertise in your industry":
    "Leverage their deep industry knowledge for product development and customer understanding. Focus on expert positioning strategies while ensuring they validate beyond their own assumptions.",

  "None of the above":
    "Focus on beginner-friendly approaches, leveraging personal networks, and finding co-founders or partners to complement skill gaps. Emphasize proven, accessible strategies.",
};

export {
  levels,
  capitalOptions,
  timeAvailabilities,
  goals,
  archetypes,
  journeyStages,
  backgroundStrengths,
};
