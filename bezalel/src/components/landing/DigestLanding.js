"use client";

import { useState } from "react";
import Link from "@/components/loading/NavigationLink";
import RollingMascot from "@/components/brand/RollingMascot";
import styles from "./digestLanding.module.css";

const insights = [
  { initials: "01", title: "Test the assumption first", context: "Strategy / Customer demand", priority: "NOW", summary: "Your plan depends on small teams needing help with onboarding. That assumption needs evidence before you invest in more features.", signal: "Your canvas identifies a problem worth testing, but it does not yet establish willingness to pay.", action: "Speak with three people in your target segment. Ask how they solve the problem today and what it costs them in time or money.", goal: "Validate demand" },
  { initials: "02", title: "A conversation worth having", context: "People / Customer discovery", priority: "EXPLORE", summary: "Alex Morgan, founder at Fieldwork, is working on a challenge related to the audience you want to serve.", signal: "A public post describes the difficulty of making onboarding personal as a small software business grows.", action: "Ask Alex where new customers get stuck. Learn about the problem before deciding whether to introduce your product.", goal: "Understand customers" },
  { initials: "03", title: "Keep expansion for later", context: "Focus / Business priorities", priority: "LATER", summary: "A second customer segment could be promising, but exploring it now would divide attention while the first segment is still unvalidated.", signal: "Your current plan prioritizes learning from your first customers. The new segment would need a different message and new assumptions to test.", action: "Keep the idea in your canvas for later. Revisit it once you have evidence that the first segment has a problem they will pay to solve.", goal: "Stay focused" },
];

function Brand() {
  return <span className={styles.brand}><span className={styles.mark}>b.</span> bezalel<span className={styles.beta}>BETA</span></span>;
}

export default function DigestLanding() {
  const [selected, setSelected] = useState(0);
  const insight = insights[selected];
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <header className={styles.header}>
        <a href="#" aria-label="Bezalel home"><Brand /></a>
        <nav aria-label="Main navigation"><a className={styles.navSection} href="#how-it-works">How it works</a><Link href="/auth/signin">Sign in</Link><Link className={styles.navCta} href="/auth/signup">Get started <span aria-hidden="true">↗</span></Link></nav>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span className={styles.dot} /> YOUR AI BUSINESS COFOUNDER</p>
            <h1 id="hero-title">Know what<br />matters.<br /><em>Build what’s next.</em><span className={styles.asterisk} aria-hidden="true">✳</span></h1>
            <p className={styles.intro}>A thinking partner for the business you’re building. Bezalel connects your goals, research, and opportunities to help you decide what deserves your attention—and what to do next.</p>
            <div className={styles.actions}><Link href="/auth/signup" className={styles.primary}>Meet your cofounder <span aria-hidden="true">↗</span></Link><a href="#daily-digest" className={styles.textLink}>Take a little look <span aria-hidden="true">↓</span></a></div>
            <p className={styles.note}>Your ambition. A little more perspective. A clearer next step.</p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.mascot}><RollingMascot /></div>
            <div className={styles.digest} id="daily-digest">
              <div className={styles.digestTop}><span><span aria-hidden="true">✳</span> THE DAILY DIGEST</span><span className={styles.sample}>INTERACTIVE EXAMPLE</span></div>
              <div className={styles.digestHeading}><p>A little momentum for your day.</p><h2>What matters next.</h2><span>Your business, with a little more perspective.</span></div>
              <div className={styles.prospects} aria-label="Example business insights">
                {insights.map((item, index) => <button type="button" key={item.title} aria-pressed={selected === index} aria-controls="insight-detail" className={`${styles.person} ${selected === index ? styles.selected : ""}`} onClick={() => setSelected(index)}><span className={styles.avatar}>{item.initials}</span><span className={styles.personName}><strong>{item.title}</strong><small>{item.context}</small></span><span className={styles.fit}><small>{item.priority}</small></span><span aria-hidden="true">↗</span></button>)}
              </div>
              <div className={styles.detail} id="insight-detail" aria-live="polite" aria-atomic="true">
                <div className={styles.detailLabel}><span className={styles.dot} /> YOUR GOAL <span>{insight.goal}</span></div>
                <p>{insight.summary}</p>
                <div className={styles.signal}><span>WHY IT MATTERS</span><p>{insight.signal}</p></div>
                <div className={styles.angle}><span>A SUGGESTED NEXT STEP <span aria-hidden="true">↗</span></span><p>{insight.action}</p></div>
              </div>
              <div className={styles.digestFoot}><span>A little clarity. Your next move.</span><span aria-hidden="true">✳</span></div>
            </div>
            <p className={styles.caption}>Illustrative digest with fictional examples. Select an insight to explore.</p>
          </div>
        </section>
        <div className={styles.promise}><span>A little clarity. Every day.</span><span>Your goals <i>✳</i> Useful intelligence <i>✳</i> Clear next steps</span></div>
        <section className={styles.how} id="how-it-works" aria-labelledby="how-title">
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>A LITTLE RHYTHM FOR YOUR BUSINESS</p><h2 id="how-title">Big ambition.<br /><em>A thoughtful partner.</em></h2><p>Give your ideas structure, question your assumptions, and keep your next decision connected to the business you want to build.</p></div>
          <div className={styles.steps}>
            <article><span className={styles.stepNumber}>01 / SET THE DIRECTION</span><div className={styles.stepArt} aria-hidden="true"><span>YOUR BUSINESS</span><b>↓</b><span className={styles.greenTag}>Your goals & direction</span></div><h3>Start with your ambition.</h3><p>Build a canvas around your idea, customers, and value proposition. Give Bezalel the context to think through the business with you.</p></article>
            <article><span className={styles.stepNumber}>02 / EXPLORE WHAT MATTERS</span><div className={styles.stepArt} aria-hidden="true"><span className={styles.miniFaces}>IDEAS <i>↔</i> EVIDENCE</span><span className={styles.greenTag}>+ A new perspective</span></div><h3>Look beyond the idea.</h3><p>Research your market, challenge an assumption, or find people worth talking to. Explore opportunities in the context of your business.</p></article>
            <article><span className={styles.stepNumber}>03 / CHOOSE YOUR NEXT STEP</span><div className={styles.stepArt} aria-hidden="true"><span className={styles.hello}>“What moves us forward?”</span><span className={styles.greenTag}>A considered next step ↗</span></div><h3>Open your daily digest.</h3><p>Make the digest your daily check-in. Review what surfaced, follow the evidence, and decide what to act on, explore, or leave for later.</p></article>
          </div>
        </section>
        <section className={styles.editorial} aria-labelledby="perspective-title"><div><p className={styles.eyebrow}>THE BUSINESS BEHIND THE TO-DO LIST</p><h2 id="perspective-title">A cofounder helps you<br /><em>see the bigger picture.</em></h2></div><div className={styles.editorialDetails}><p>What are we trying to achieve? What do we actually know? What would move us forward? Bezalel helps you work through the questions behind your next decision.</p><ul><li><span>01</span><div><h3>Grounded in your business</h3><p>Your canvas gives research and recommendations a shared context.</p></div></li><li><span>02</span><div><h3>Room to question the plan</h3><p>Explore evidence that supports or challenges an idea before committing to it.</p></div></li><li><span>03</span><div><h3>You decide the next step</h3><p>Run an experiment, reach out to someone, refine the strategy, or stay focused. You make the call.</p></div></li></ul></div></section>
        <section className={styles.closing}><p className={styles.eyebrow}>A LITTLE MOTION. A NEW PERSPECTIVE.</p><h2>Build your business<br />with <em>a little more clarity.</em></h2><Link href="/auth/signup" className={styles.primary}>Get things rolling <span aria-hidden="true">↗</span></Link><p>Think it through. Find your focus. Keep building.</p></section>
      </main>
      <footer className={styles.footer}><a href="#" aria-label="Bezalel home"><Brand /></a><p>Your business cofounder. A little more momentum.</p><Link href="/auth/signin">Let’s get to work ↗</Link></footer>
    </div>
  );
}
