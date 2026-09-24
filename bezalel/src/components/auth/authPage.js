import Image from "next/image";
import Link from "@/components/loading/NavigationLink";
import GoogleAuthProvider from "./GoogleAuthProvider";
import Mark from "../../../public/images/logos/Mark.png";
import styles from "./auth.module.css";

// The shell renders on the server; only the sign-in action needs hydration.
export default function AuthPage({ heading, cta }) {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back} aria-label="Back to home">
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 12H4m7-7-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </Link>
      <section className={styles.form} aria-labelledby="auth-heading">
        <h1 id="auth-heading" className={styles.heading}>{heading}</h1>
        <GoogleAuthProvider cta={cta} />
      </section>
      <aside className={styles.artwork}>
        <Image src={Mark} alt="Bezalel Logo" width={300} height={300} sizes="300px" className={styles.logo} />
      </aside>
    </main>
  );
}
