const levels = {
  beginner:
    "This user is a first-time founder with no business experience. Prioritize simple, proven strategies with step-by-step guidance. Avoid complex frameworks or jargon. Focus on low-risk approaches and emphasize learning fundamentals before scaling. Suggest resources for business basics.",

  intermediate:
    "This user has some business experience and understands basic concepts. Provide more sophisticated strategies and frameworks. They can handle moderate complexity and risk. Focus on optimization and growth tactics while still explaining reasoning behind recommendations.",

  expert:
    "This user is an experienced founder who understands advanced business concepts. Provide sophisticated, nuanced strategies. They can evaluate complex trade-offs and high-risk/high-reward approaches. Focus on competitive advantages and advanced optimization techniques.",
};

const capitalOptions = {
  "0 - 100":
    "This user has $0-100 to invest. Focus exclusively on bootstrapped strategies using free tools, organic marketing, personal networks, and leveraging existing skills. Prioritize revenue generation over growth. Suggest bartering, pre-sales, and zero-upfront-cost models.",

  "100 - 500":
    "This user has $100-500 to invest. Suggest cost-effective basic tools, minimal paid advertising for testing, and low-risk validation methods. Focus on lean approaches that can generate quick returns. Consider freemium tools with paid upgrades only when validated.",

  "500 - 1000":
    "This user has $500-1000 to invest. Include basic paid tools, small-scale advertising tests, professional branding elements, and initial inventory or software subscriptions. Balance investment in validation with basic professional setup.",

  "1000 - 5000":
    "This user has $1000-5000 to invest. Suggest professional tools, meaningful marketing budgets, hiring for specific tasks, initial inventory investment, or software development. Focus on strategies that can scale with modest investment.",

  "5000 - 10000":
    "This user has $5000-10000 to invest. Include comprehensive tool stacks, significant marketing campaigns, hiring part-time help, substantial inventory, or custom development. Balance growth investment with sustainable cash flow.",

  "10000 and above":
    "This user has $10000+ to invest. Suggest premium tools, full marketing campaigns, hiring employees or agencies, large inventory investments, or custom software development. Focus on scalable strategies and competitive differentiation through investment.",
};

const timeAvailabilities = {
  "Max 5":
    "This user has 0-5 hours weekly. Focus on highly automated, low-maintenance strategies. Prioritize passive income models, automated marketing, outsourcing, and solutions requiring minimal ongoing management. Suggest batch work and high-impact activities only.",

  "Max 15":
    "This user has 5-15 hours weekly. Balance automation with hands-on activities. Include some manual marketing, customer service, and product development, but emphasize efficient processes and tools that maximize output per hour invested.",

  "Max 30":
    "This user has 15-30 hours weekly. Allow for more hands-on approaches including active marketing, regular content creation, direct customer engagement, and iterative product development. Focus on sustainable growth strategies.",

  Fulltime:
    "This user has 30-40+ hours weekly. Include comprehensive strategies requiring significant time investment like extensive content creation, active sales, complex product development, and hands-on customer acquisition. Focus on rapid growth and scaling.",
};

const goals = {
  "Side hustle":
    "This user wants supplemental income while maintaining other commitments. Focus on predictable, scalable revenue streams that won't interfere with their primary obligations. Emphasize sustainable, stress-free approaches and realistic income expectations.",

  "Full income":
    "This user needs to replace their primary income. Focus on scalable revenue models with significant income potential. Emphasize strategies that can grow to $50K+ annually. Include aggressive growth tactics and multiple revenue streams.",

  Testing:
    "This user wants to validate their idea with minimal commitment. Focus on rapid, low-cost validation methods like MVPs, landing page tests, pre-sales, and market research. Emphasize learning and data collection over immediate revenue.",

  Improve:
    "This user has an existing business they want to optimize. Focus on growth strategies, efficiency improvements, new revenue streams, and competitive advantages. Analyze current performance gaps and scaling opportunities.",

  "Care about":
    "This user is mission-driven and wants to solve a meaningful problem. Balance impact with sustainability. Focus on customer value, long-term vision, and strategies that align profit with purpose. Emphasize authentic brand building.",
};

const archetypes = {
  "SaaS / Cloud Software":
    "This user wants to build recurring revenue software. For beginners, emphasize no-code/low-code solutions and simple tools. For experts, focus on technical differentiation and enterprise features. Prioritize subscription models, user retention, and scalable infrastructure.",

  "E-commerce / D2C":
    "This user wants to sell physical products online. Focus on product sourcing, inventory management, conversion optimization, and fulfillment logistics. Emphasize brand building, customer acquisition costs, and profit margins per unit.",

  "Local Services":
    "This user provides in-person services in a geographic area. Focus on local SEO, community networking, referral systems, and service delivery optimization. Emphasize reputation management and capacity scaling within geographic constraints.",

  "Creator / Content Engine":
    "This user wants to monetize through content and community. Focus on audience building, content consistency, multiple monetization streams (ads, sponsorships, products, memberships), and community engagement strategies.",

  "Subscription Box / Membership":
    "This user wants recurring revenue through curated experiences or exclusive access. Focus on customer retention, churn reduction, supply chain management, and creating ongoing value that justifies recurring payments.",

  "Consumer Mobile App":
    "This user wants to create a mobile application for consumers. Focus on user acquisition, app store optimization, engagement metrics, monetization strategies (freemium, ads, in-app purchases), and retention tactics.",

  "EdTech / Online Learning":
    "This user wants to create educational content or platforms. Focus on curriculum development, student engagement, learning outcomes, certification value, and scalable delivery methods. Emphasize authority building and student success metrics.",
};

export { levels, capitalOptions, timeAvailabilities, goals, archetypes };
