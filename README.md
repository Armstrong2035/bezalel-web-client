## Project Architecture

This project is a modular Next.js web client for Armstrong/Bezalel, structured for scalability and maintainability.

### Main Structure

- **app/**  
  Next.js app directory, contains routing and page components.

- **src/components/**  
  Reusable React components, organized by feature:

  - **onboarding/**: Components for user onboarding flow (e.g., `QuestionCard`)
  - **segment/**: Canvas segment features, including:

    - **canvasItem/**: Individual canvas segment rendering (`CanvasItem.js`)
    - **segmentIdeas/**: Idea management for segments
      - **ideaCard/**: Modal and scoring for ideas (`IdeaModal`, `IdeaScores`, `ProgressBar`)
      - **GeneratedIdeas.js**: Displays generated ideas for a segment
      - **GetStartedCard.js**: Intro card for segment ideas

  - **ui/**: Shared UI elements (e.g., `HelpToolTip.js`)

- **src/store/**  
  State management (Zustand stores for onboarding, segment ideas, etc.)

- **src/services/**  
  API and Firestore logic for data fetching and mutations.

### Data Flow

- **Onboarding**:  
  User answers are collected and validated in onboarding components, then mapped and submitted to the backend.

- **Canvas Segments & Ideas**:  
  Each segment can have multiple ideas, managed as separate Firestore documents. UI components display, score, and update ideas.

- **API Layer**:  
  Next.js API routes handle CRUD operations for onboarding data and segment ideas, including PATCH endpoints for updating idea status.

### UI/UX

- Modular, reusable components for onboarding and segment management.
- Tooltips and modals for enhanced user guidance.
- Progress indicators for onboarding and idea scoring.

### State Management

- Zustand is used for local state (onboarding progress, segment ideas, etc.).
- API calls update Firestore and synchronize state.

---

Feel free to expand this section as your project
