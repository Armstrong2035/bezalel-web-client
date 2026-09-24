# Opportunity research feedback loop

## Current focus

Keep the first opportunity service simple: Explorium supplies identity, enrichment, and public evidence; Bezalel provides an ICP match score; the user remains the final judge.

## Feedback we need to capture

- Person-level: strong match, weak match, not a match, already known, research deeper, add to inbox, dismiss.
- Signal-level: useful, not useful, recent enough, specific, credible, generic, incorrect, or outdated.
- Batch-level: excellent, useful, mixed, or mostly noise.
- Outcome-level: contacted, personalized, received a reply, had a conversation, became a relationship/opportunity.

## Learning questions

- Which signal types consistently lead to accepted people?
- Which sources produce useful evidence versus noise?
- Is Bezalel overconfident or underconfident in its ICP scores?
- Which low-scoring people later become valuable?
- Which signals are interesting but not actionable?

## Product rules

1. Never silently discard a person because of Bezalel's score.
2. Show the Explorium evidence and source trail alongside the score.
3. Treat "Research deeper with Bezalel" as an explicit, optional action.
4. Version the ICP, prompt, scoring logic, provider, and research run.
5. Optimize for meaningful actions and outcomes, not clicks alone.

## Initial metrics

- ICP match acceptance rate
- Dismissal and correction rate
- Research-deeper rate
- Add-to-inbox rate
- Signal usefulness rate
- Source correction rate
- Contact and reply rate
- Positive outcome rate

## Next feedback module

Add lightweight controls to each result and signal, a batch rating after every five-person run, and an admin view that compares signal quality by source, signal type, ICP, prompt version, and provider.

## Email follow-up

Recipients: armstrongolusoji9@gmail.com, armstrong@poysis.com

Subject: Opportunity research service — feedback loop and current focus

The first opportunity service should stay intentionally simple. Explorium will provide identity, enrichment, and public evidence. Bezalel will provide an ICP match score, but the user will remain the final judge. A “Research deeper with Bezalel” action will trigger Bezalel’s own web research only when requested.

We also need a feedback loop to learn whether the signals are right. We should capture feedback at the person level, signal level, batch level, and eventually outcome level. The first metrics should be match acceptance, dismissal, correction, research-deeper, add-to-inbox, signal usefulness, source correction, contact, reply, and positive outcome rates.

The guiding rule is: show the evidence, explain the score, expose uncertainty, and make disagreement easy. Optimize for meaningful actions and outcomes—not clicks alone.
