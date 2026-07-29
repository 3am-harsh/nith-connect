import React from 'react';

export const metadata = {
  title: 'Delete Account & Data | NITH Connect',
  description: 'Request account deletion and personal data removal from NITH Connect.',
};

export default function DeleteAccountPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoBlock}>
          <span style={styles.logoText}>NITH Connect</span>
        </div>
        <h1 style={styles.title}>Account & Data Deletion</h1>
        <p style={styles.subtitle}>Request account closure and personal data removal</p>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Data Deletion Policy</h2>
          <p style={styles.text}>
            In compliance with Google Play Developer policies regarding user data safety, NITH Connect provides a simple and transparent method for users to request the permanent deletion of their account and all associated personal information.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What Data is Deleted?</h2>
          <p style={styles.text}>
            When you request account deletion, the following data is permanently purged from our Google Firebase databases:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Profile & Identity:</strong> Your name, Google account email association, profile picture, and verified student credentials.
            </li>
            <li style={styles.listItem}>
              <strong>Academic Metadata:</strong> Your NITH roll number, department, year of study, and hostel specifications.
            </li>
            <li style={styles.listItem}>
              <strong>User Bulletins:</strong> Any Lost & Found items reported by you (including associated descriptions, contact numbers, and photos).
            </li>
            <li style={styles.listItem}>
              <strong>Communications:</strong> Your messages inside public campus chatrooms are permanently removed or anonymized.
            </li>
          </ul>
          <p style={styles.notice}>
            <strong>Retention Period:</strong> Once initiated, the deletion process is irreversible. Your data is deleted from our databases immediately and is cleared from system backups within 7 days.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>How to Request Deletion</h2>
          
          <div style={styles.optionsContainer}>
            <div style={styles.optionCard}>
              <h3 style={styles.optionTitle}>Method 1: Direct Email Request</h3>
              <p style={styles.optionText}>
                Send a deletion request from your registered college email to the developer support inbox:
              </p>
              <div style={styles.emailBlock}>
                Email: <a href="mailto:djfgh7033@gmail.com" style={styles.link}>djfgh7033@gmail.com</a>
              </div>
              <p style={styles.optionMeta}>
                Please use the subject <strong>{`"Account Deletion Request"`}</strong> and include your NITH roll number for verification. Requests are processed within 24–48 hours.
              </p>
            </div>

            <div style={styles.optionCard}>
              <h3 style={styles.optionTitle}>Method 2: In-App Request</h3>
              <p style={styles.optionText}>
                Log in to the NITH Connect mobile or web app:
              </p>
              <ol style={styles.orderedList}>
                <li style={styles.orderedListItem}>Open the <strong>Profile</strong> drawer in the top-left.</li>
                <li style={styles.orderedListItem}>Scroll to the bottom of the settings sidebar.</li>
                <li style={styles.orderedListItem}>Click <strong>Sign Out</strong> or contact support to trigger manual purging.</li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>© 2026 NITH Connect. All Rights Reserved. Not affiliated officially with NIT Hamirpur.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#2d3748',
    lineHeight: '1.6',
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center' as const,
    borderBottom: '2px solid #edf2f7',
    paddingBottom: '30px',
    marginBottom: '40px',
  },
  logoBlock: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#125b44',
    padding: '8px 16px',
    borderRadius: '20px',
    marginBottom: '16px',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#125b44',
    margin: '10px 0 5px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  main: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '35px',
  },
  section: {
    display: 'block',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '12px',
  },
  text: {
    margin: '0 0 14px 0',
    color: '#4a5568',
  },
  list: {
    margin: '0 0 16px 0',
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '10px',
    color: '#4a5568',
  },
  notice: {
    backgroundColor: '#fffaf0',
    borderLeft: '4px solid #dd6b20',
    padding: '12px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#dd6b20',
    margin: '16px 0 0 0',
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '15px',
  },
  optionCard: {
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#125b44',
    margin: '0 0 12px 0',
  },
  optionText: {
    fontSize: '13px',
    color: '#4a5568',
    margin: '0 0 12px 0',
  },
  emailBlock: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '12px',
  },
  optionMeta: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  },
  orderedList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '13px',
    color: '#4a5568',
  },
  orderedListItem: {
    marginBottom: '8px',
  },
  link: {
    color: '#2a9d8f',
    textDecoration: 'none',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center' as const,
    borderTop: '1px solid #edf2f7',
    paddingTop: '20px',
    marginTop: '50px',
    fontSize: '12px',
    color: '#a0aec0',
  },
};
