import styles from "@/components/loading/navigation.module.css";

export default function RollingMascot() {
  return (
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
  );
}
