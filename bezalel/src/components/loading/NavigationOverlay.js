"use client";

import { useEffect, useRef } from "react";
import styles from "./navigation.module.css";

export default function NavigationOverlay({ phase, slow, label, onDismiss }) {
  const overlay = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      // The old button may have unmounted. Move focus into the newly revealed page.
      const target = previousFocus?.isConnected && previousFocus !== document.body
        ? previousFocus : document.querySelector("main h1, main, h1");
      if (!target) return;
      const hadTabIndex = target.hasAttribute("tabindex");
      if (!hadTabIndex) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (!hadTabIndex) target.removeAttribute("tabindex");
    };
  }, []);

  const trapFocus = (event) => {
    if (event.key !== "Tab") return;
    const buttons = overlay.current.querySelectorAll("button");
    if (!buttons.length) { event.preventDefault(); return; }
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === overlay.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  };

  return (
    <div ref={overlay} className={`${styles.overlay} ${phase === "revealing" ? styles.revealing : ""}`}
      role="dialog" aria-modal="true" aria-labelledby="navigation-loading-title"
      aria-describedby="navigation-loading-description" tabIndex={-1} onKeyDown={trapFocus}>
      <div className={styles.composition}>
        <div className={styles.signature}><span className={styles.brandMark} aria-hidden="true">b.</span> BEZALEL</div>
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.orbit} />
          <span className={`${styles.spark} ${styles.sparkOne}`}>✳</span>
          <span className={`${styles.spark} ${styles.sparkTwo}`}>+</span>
          <span className={styles.trail} />
          <div className={styles.shadow} />
          <div className={styles.roller}>
            <span className={`${styles.handle} ${styles.handleLeft}`} />
            <div className={styles.barrel}>
              <div className={styles.ridges} />
              <div className={styles.face}><i /><i /></div>
              <span className={styles.shine} />
            </div>
            <span className={`${styles.handle} ${styles.handleRight}`} />
          </div>
        </div>
        <div className={styles.eyebrow}><span /> A LITTLE MOMENT</div>
        <h2 id="navigation-loading-title" className={styles.title}>Good things are rolling.</h2>
        <p id="navigation-loading-description" className={styles.description} role="status" aria-live="polite">
          {slow ? "This is taking a little longer. We're still waiting for your page." : `${label}...`}
        </p>
        <div className={styles.track} aria-hidden="true"><span /></div>
        {slow && <div className={styles.recovery}>
          <button onClick={() => window.location.reload()}>Reload page</button>
          <button onClick={onDismiss}>Close loading screen</button>
        </div>}
      </div>
      <span className={styles.footer} aria-hidden="true">A little motion. A new perspective.</span>
    </div>
  );
}
