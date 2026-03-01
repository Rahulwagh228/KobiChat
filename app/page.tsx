
import React from 'react';
import styles from './page.module.scss';
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.heroWrapper}>
      {/* Dynamic Background Elements */}
      <div className={styles.backgroundShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
      </div>

      {/* Main Content Card */}
      <div className={styles.content}>
        <div className={styles.logo}>KobiChat</div>
        <h1 className={styles.title}>Connect Instantly, Chat Seamlessly</h1>
        <p className={styles.description}>
          The next generation of secure and fast messaging. Join millions of users around the world and stay connected with your friends, family, and colleagues in real-time.
        </p>

        {/* Action Buttons */}
        <div className={styles.buttonGroup}>
          <Link href="/auth?view=login" className={`${styles.btn} ${styles.secondaryBtn}`}>
            Login to Account
          </Link>
          <Link href="/auth?view=signup" className={`${styles.btn} ${styles.primaryBtn}`}>
            Start Free Signup
          </Link>
          <Link href="/Chat" className={`${styles.btn} ${styles.accentBtn}`}>
            Go to Chat <span style={{ marginLeft: '10px' }}>🚀</span>
          </Link>
        </div>

        {/* Feature Icons (Small visual touches) */}
        <div className={styles.floatingIcons}>
          <div className={styles.icon}>🔒 Secure</div>
          <div className={styles.icon}>⚡ Fast</div>
          <div className={styles.icon}>📱 Modern</div>
        </div>
      </div>

      {/* Footer minimal info */}
      <footer style={{ position: 'absolute', bottom: '20px', fontSize: '0.8rem', opacity: 0.4 }}>
        © 2026 KobiChat Messaging System. All rights reserved.
      </footer>
    </main>
  );
}