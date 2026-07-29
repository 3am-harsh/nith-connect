import React from 'react';

export const metadata = {
  title: 'Privacy Policy | NITH Connect',
  description: 'Privacy Policy for the NITH Connect campus application.',
};

export default function PrivacyPolicy() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoBlock}>
          <span style={styles.logoText}>NITH Connect</span>
        </div>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.subtitle}>Effective Date: July 29, 2026</p>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Introduction</h2>
          <p style={styles.text}>
            Welcome to NITH Connect {`("we", "our", or "us")`}. We are committed to protecting the privacy of students and members of the National Institute of Technology, Hamirpur (NIT Hamirpur) community who use our campus mobile and web application. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Information We Collect</h2>
          <p style={styles.text}>
            To provide a secure and customized experience for NITH students, we collect the following types of information:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Authentication Data:</strong> When you sign in using Google Sign-In, we collect your verified name, email address, and profile picture.
            </li>
            <li style={styles.listItem}>
              <strong>Academic & Profile Details:</strong> During registration, we collect your NITH roll number, department, year of study, hostel name, contact details, and optional details like blood group.
            </li>
            <li style={styles.listItem}>
              <strong>User-Generated Content:</strong> We store messages sent in campus chatrooms, items reported in the Lost & Found bulletin (including descriptions, locations, contact numbers, and uploaded photos), and timetables or files shared with the community.
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. How We Use Your Information</h2>
          <p style={styles.text}>
            We use the collected information to operate and maintain the campus network, specifically:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>To verify your student status at NIT Hamirpur.</li>
            <li style={styles.listItem}>To enable real-time messaging inside community chatrooms.</li>
            <li style={styles.listItem}>To publish your reported items in the Lost & Found bulletin.</li>
            <li style={styles.listItem}>To display academic timetables and campus announcements.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Data Sharing and Disclosure</h2>
          <p style={styles.text}>
            We respect student privacy and do not sell, trade, or share your personal data with third-party advertising companies or outside organizations. Your profile information is visible only to other authenticated users on the platform to encourage trusted peer-to-peer campus communication.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Data Security</h2>
          <p style={styles.text}>
            Your information is stored securely on Google Firebase Cloud Firestore and authenticated using Firebase Auth. We implement technical and administrative security controls to protect your data from unauthorized access, loss, or misuse.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Your Rights and Controls</h2>
          <p style={styles.text}>
            You can view, edit, or update your contact details and bio directly inside the <strong>Profile</strong> drawer. If you wish to delete your account or remove specific posts/announcements, you can contact the developer team.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Contact Us</h2>
          <p style={styles.text}>
            If you have any questions or concerns regarding this Privacy Policy, please contact the developer team at:
          </p>
          <div style={styles.contactCard}>
            <strong>NITH Connect Developer Team</strong><br />
            Email: <a href="mailto:djfgh7033@gmail.com" style={styles.link}>djfgh7033@gmail.com</a><br />
            NIT Hamirpur, Himachal Pradesh, India
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
    gap: '30px',
  },
  section: {
    display: 'block',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '10px',
  },
  text: {
    margin: '0 0 12px 0',
    color: '#4a5568',
  },
  list: {
    margin: '0 0 16px 0',
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '8px',
    color: '#4a5568',
  },
  contactCard: {
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '10px',
    fontSize: '14px',
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
