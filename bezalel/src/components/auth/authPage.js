import Link from "@/components/loading/NavigationLink";
import GoogleAuthProvider from "./GoogleAuthProvider";
import RollingMascot from "@/components/brand/RollingMascot";
import styles from "./auth.module.css";
import AuthGuestGuard from "./AuthGuestGuard";

// Keep the shell server-rendered, with session checks handled by the guest guard.
export default function AuthPage({ cta }) {
  const signingUp = cta === "Sign up";
  return (
    <AuthGuestGuard>
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Bezalel home"><span className={styles.mark}>b.</span> bezalel <span className={styles.beta}>BETA</span></Link>
        <Link href="/" className={styles.back}><span aria-hidden="true">←</span> Back to home</Link>
      </header>
      <main className={styles.main}>
        <section className={styles.form} aria-labelledby="auth-heading">
          <div className={styles.formInner}>
            <p className={styles.eyebrow}><span /> YOUR AI BUSINESS COFOUNDER</p>
            <h1 id="auth-heading" className={styles.heading}>{signingUp ? <>Big ideas.<br /><em>Start here.</em></> : <>Welcome back.<br /><em>Let’s keep building.</em></>}</h1>
            <p className={styles.description}>{signingUp ? "A little more perspective for the business you want to build. Create your account and start thinking it through with Bezalel." : "Make room for your next good decision. Your canvas, research, and daily digest are waiting."}</p>
            <GoogleAuthProvider cta={cta} />
            <p className={styles.helper}>{signingUp ? "Create your account securely with Google." : "Sign in with the Google account you used to join."}</p>
            <div className={styles.switch}><span>{signingUp ? "Already building with us?" : "New to Bezalel?"}</span><Link href={signingUp ? "/auth/signin" : "/auth/signup"}>{signingUp ? "Sign in" : "Create an account"} <span aria-hidden="true">↗</span></Link></div>
          </div>
        </section>
        <aside className={styles.artwork} aria-labelledby="cofounder-heading">
          <div className={styles.artworkInner}>
            <RollingMascot />
            <p className={styles.eyebrow}>A LITTLE MOTION. A NEW PERSPECTIVE.</p>
            <h2 id="cofounder-heading">Your ambition.<br /><em>A thoughtful partner.</em></h2>
            <p className={styles.artworkDescription}>A place to think clearly about your business—and find a next step worth taking.</p>
            <div className={styles.notes}>
              <div><span>01</span><p><strong>Give your ideas direction.</strong><small>Build the picture with your business canvas.</small></p></div>
              <div><span>02</span><p><strong>Make room for evidence.</strong><small>Explore research that challenges or supports your thinking.</small></p></div>
              <div><span>03</span><p><strong>Decide what matters next.</strong><small>Review your digest and choose where to focus.</small></p></div>
            </div>
          </div>
        </aside>
      </main>
      <footer className={styles.footer}><span>Your business cofounder.</span><span>Think it through. Keep building.</span></footer>
    </div>
    </AuthGuestGuard>
  );
}
