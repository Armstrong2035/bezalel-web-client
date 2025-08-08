export const segmentPrompts = {
  valueProposition: `
    Generate 5-7 specific value proposition ideas for this user's business model canvas.
    For each value proposition:
    - Identify the specific problem it solves
    - Explain the unique benefit provided
    - Highlight what makes it different from competitors
    - Consider both functional and emotional benefits
    
    For scoring focus on:
    - Ease of Execution: How quickly can you test this with real customers?
    - Resource Alignment: Can you validate this within your constraints?
    - Market Fit: How likely are customers to pay for this solution?
    
    Prioritize propositions that align with their experience level, available capital, and time constraints.
  `,

  customerSegments: `
    Identify 3-5 distinct customer segments this user should consider targeting.
    For each segment provide:
    - Clear demographic/psychographic description
    - Primary needs and pain points
    - Why this segment is valuable to serve
    - Estimated market size (if relevant to their archetype)
    
    For scoring focus on:
    - Ease of Execution: How easily can you reach and interview this segment?
    - Resource Alignment: Can you afford to acquire customers in this segment?
    - Market Fit: How strong is demand and willingness to pay in this segment?
    
    Prioritize segments that match their capital constraints and business archetype.
    Consider both early adopters and scalable long-term segments.
  `,

  channels: `
    Suggest 6-8 specific channels for reaching and serving customers, organized by:
    - Awareness channels (how customers discover you)
    - Acquisition channels (how customers buy from you)  
    - Delivery channels (how you provide value)
    - Support channels (how you maintain relationships)
    
    For scoring focus on:
    - Ease of Execution: How quickly can you set up and test this channel?
    - Resource Alignment: Does this channel fit your budget and time constraints?
    - Market Fit: How effectively does this channel reach your target customers?
    
    Prioritize channels that fit their time availability and budget constraints.
    Include both organic and paid options where appropriate.
  `,

  revenueStreams: `
    Generate 4-6 revenue model options with specific details:
    - Revenue mechanism (subscription, one-time, usage-based, etc.)
    - What customers pay for specifically
    - Typical pricing ranges for their industry
    - Pros and cons for their situation
    
    For scoring focus on:
    - Ease of Execution: How quickly can you test customer willingness to pay?
    - Resource Alignment: Can you implement this revenue model with your resources?
    - Market Fit: How well does this pricing align with customer expectations?
    
    Consider their capital constraints and business goals.
    Include both immediate revenue opportunities and long-term scalable streams.
  `,

  keyResources: `
    Identify the 8-10 most critical resources needed, categorized as:
    - Physical assets (equipment, inventory, facilities)
    - Intellectual property (brands, patents, data)
    - Human resources (skills, expertise, team)
    - Financial resources (capital, credit, funding)
    
    For scoring focus on:
    - Ease of Execution: How quickly can you acquire or access these resources?
    - Resource Alignment: Can you afford these resources within your budget?
    - Market Fit: How essential are these resources for competitive advantage?
    
    Prioritize based on their capital constraints and business archetype.
    Distinguish between must-haves for launch vs. nice-to-haves for scaling.
  `,

  keyActivities: `
    Identify 6-8 critical activities they must excel at, organized by:
    - Production activities (creating and delivering value)
    - Marketing activities (acquiring and retaining customers)
    - Operations activities (managing the business)
    
    For each activity, explain why it's essential and how it connects to their value proposition.
    
    For scoring focus on:
    - Ease of Execution: How quickly can you implement and optimize these activities?
    - Resource Alignment: Can you execute these activities with your time and skills?
    - Market Fit: How directly do these activities create customer value?
    
    Consider their time constraints and experience level.
  `,

  keyPartners: `
    Suggest 5-7 types of strategic partnerships with:
    - Specific partner categories (suppliers, distributors, technology, etc.)
    - What value each partnership provides
    - What they offer in return
    - Examples of potential partners in their industry
    
    For scoring focus on:
    - Ease of Execution: How easily can you identify and engage potential partners?
    - Resource Alignment: Can you manage these partnerships with your available time?
    - Market Fit: How much do these partnerships reduce risk or accelerate growth?
    
    Focus on partnerships that reduce costs, risks, or resource requirements.
    Consider their capital constraints and business archetype.
  `,

  costStructure: `
    Break down their major cost categories with:
    - Fixed costs (rent, salaries, software subscriptions)
    - Variable costs (materials, transaction fees, marketing spend)
    - Estimated cost ranges for their business type
    - Which costs are most critical to manage
    
    For scoring focus on:
    - Ease of Execution: How easily can you track and optimize these costs?
    - Resource Alignment: How well do these costs fit within your budget constraints?
    - Market Fit: How do these costs compare to industry standards?
    
    Highlight cost optimization opportunities and potential economies of scale.
    Consider their capital constraints and revenue timeline.
  `,

  customerRelationships: `
    Define 4-6 relationship strategies for different customer segments:
    - Acquisition approach (how to get new customers)
    - Onboarding process (how to get them started)
    - Retention tactics (how to keep them engaged)
    - Growth strategies (how to increase customer value)
    
    For scoring focus on:
    - Ease of Execution: How quickly can you implement these relationship approaches?
    - Resource Alignment: Can you maintain these relationships with your time and budget?
    - Market Fit: How well do these approaches match customer expectations?
    
    Match relationship intensity to customer lifetime value and business constraints.
    Balance automation with personal touch based on their time availability.
  `,
};
