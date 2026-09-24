# Bezalel roadmap

## Email-style document interface

- Commit to an email-style workspace with documents as the primary navigation items and activity attached to each document.
- Show unread activity and a concise latest-activity preview on document entries. Keep unread updates distinct from items requiring action.
- Explore a bento overview combining a main documents section, items needing attention, and a recent-activity feed. Use consistent document entries within the sections for easy scanning.
- Open documents in a split view with a collapsible left pane, giving each document room for its working interface. Explore Documents and Activity tabs in the compact pane.
- Route notifications to their document and, where possible, the relevant comment, change, or request.
- Preserve the pane's collapsed state and the document list's filters and scroll position when navigating. Keep the document title, essential actions, and access to notifications available while focused.

## Adaptive feedback engine

- Design feedback as a recursive learning loop for improving Bezalel continuously: ask for feedback, store each response, classify it, discover recurring topics, and use those topics to shape subsequent feedback prompts.
- Start with an open text prompt. Store the original response alongside its product context, timestamp, and any subsequent classification so the source feedback remains available.
- Run responses through a classification model or LLM to identify topics and group related feedback into evolving feedback topics.
- Turn recurring topics into selectable options in future feedback boxes: radio buttons for a single choice, or checkboxes when multiple topics apply.
- After a topic is selected, prompt for a short explanation or example. This interprets the proposed “add a simple…” follow-up as a brief text response; finalize the wording during design.
- Keep an open-text option for new topics so existing choices do not prevent discovery. Feed both selections and explanations back into classification to refine, merge, or introduce topics over time.
- Connect emerging topics to product improvements and follow-up feedback, tracking whether shipped changes resolve the reported problems. Adapt prompts continuously; define a separate review process for product changes.

## Social listening with Grokbot

- Explore Grokbot for defining topics and tracking relevant conversations on X.
- Initial topics: movies, chess, and artificial intelligence.
- Provide a way to add, edit, and enable or disable tracked topics.
- Surface relevant posts and topic summaries with links to their sources, making it possible to inspect the underlying conversations.
- Validate Grokbot's available integration, X access, and refresh capabilities before implementation; define how listening results connect to Bezalel's document workflow.

## Schedules and timed automations

- Let users schedule recurring actions with a selected provider, task, interval, and destination document or workspace. Run schedules in the background even when the app is closed.
- Initial Grokbot automation: every 15 minutes, activate Grokbot to check X for new activity on the enabled listening topics (initially movies, chess, and artificial intelligence), and attach new results to the relevant workspace.
- Initial Explorium automation: every 12 hours, retrieve and deliver five new contacts matching the workspace's configured targeting criteria. Avoid contacts already delivered; report any shortfall when fewer than five new matches are available.
- Surface automation results as document activity, with notifications and links to the full results.
- Provide controls to create, edit, pause, resume, and delete schedules, plus a run-now action. Show the next run, last run, and run history with success or failure status.
- Define start times and timezone handling. Prevent overlapping runs and duplicate deliveries, retry transient failures within limits, and respect provider quotas and usage budgets.
- Validate provider access and supported scheduling frequencies during implementation. These are roadmap requirements; no recurring jobs are activated by this entry.
