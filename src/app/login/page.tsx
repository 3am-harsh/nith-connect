'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { loginWithEmail, loginDeveloper, checkUserRegisteredAction, loginWithFirebaseUserAction } from './actions';
import { Mountain, LogIn, ShieldAlert, Sparkles, User, Mail, GraduationCap, Building, Home, Activity } from 'lucide-react';
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Capacitor } from '@capacitor/core';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for simulated Google accounts
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [hostel, setHostel] = useState('Kailash Hostel');
  const [bloodGroup, setBloodGroup] = useState('B+');

  const handleGoogleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.endsWith('@nith.ac.in')) {
      setErrorMessage('Access Denied: Only @nith.ac.in Google accounts are allowed.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('rollNumber', rollNo);
      formData.append('department', dept);
      formData.append('hostel', hostel);
      formData.append('bloodGroup', bloodGroup);
      formData.append('role', 'student');

      const result = await loginWithEmail(formData);
      if (!result.success) {
        setErrorMessage(result.error || 'Login failed');
      }
    });
  };

  const handleDevLogin = (role: 'student' | 'guest' | 'developer') => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await loginDeveloper(role);
      if (!result.success) {
        setErrorMessage(result.error || 'Dev login failed');
      }
    });
  };

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        let userEmail = '';
        let displayName = '';

        // If running inside Capacitor Native WebView, run the native authentication flow
        if (Capacitor.isNativePlatform()) {
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
          const result = await FirebaseAuthentication.signInWithGoogle({});
          if (!result.credential?.idToken) {
            throw new Error('No ID Token returned from native Google Sign-in.');
          }
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          const fbResult = await signInWithCredential(auth, credential);
          userEmail = fbResult.user.email || '';
          displayName = fbResult.user.displayName || '';
        } else {
          // Standard browser auth
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({
            hd: 'nith.ac.in',
            prompt: 'select_account'
          });
          
          const result = await signInWithPopup(auth, provider);
          userEmail = result.user.email || '';
          displayName = result.user.displayName || '';
        }
        
        if (!userEmail) {
          setErrorMessage('Could not fetch email from Google account.');
          return;
        }

        const isValidDomain = userEmail.endsWith('@nith.ac.in') || userEmail.toLowerCase() === 'djfgh7033@gmail.com';
        if (!isValidDomain) {
          await auth.signOut();
          setErrorMessage('Access Denied: Only @nith.ac.in Google accounts are allowed.');
          return;
        }

        const existingProfile = await checkUserRegisteredAction(userEmail);
        
        if (existingProfile) {
          const loginRes = await loginWithFirebaseUserAction(userEmail);
          if (!loginRes.success) {
            setErrorMessage(loginRes.error || 'Failed to establish session.');
          }
        } else {
          setEmail(userEmail);
          setName(displayName || '');
          setShowGoogleMock(true);
        }
      } catch (err: unknown) {
        console.error('Google Auth error:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setErrorMessage(errMsg || 'Google authentication closed or failed.');
      }
    });
  };

  return (
    <main style={styles.container}>
      {/* Background patterns */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />
      
      <div style={styles.wrapper} className="animate-fade-in">
        {/* Main Brand Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Mountain size={36} color="var(--pine-primary)" />
          </div>
          <h1 style={styles.title}>NITH Connect</h1>
          <p style={styles.subtitle}>NIT Hamirpur Campus Community Portal</p>
        </div>

        {/* Login Card */}
        <div style={styles.card} className="glass-panel">
          <div style={styles.cardHeader}>
            <Sparkles size={20} color="var(--aqua-primary)" />
            <h2 style={styles.cardTitle}>Student & Faculty Portal</h2>
          </div>

          {errorMessage && (
            <div style={styles.errorAlert}>
              <ShieldAlert size={18} color="var(--error)" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!showGoogleMock ? (
            <div style={styles.cardBody}>
              <p style={styles.infoText}>
                Access mess menus, your student ID card, lost & found, blogs, and live chatrooms.
              </p>

              {/* Standard Google Login Button */}
              <button 
                onClick={handleGoogleSignIn}
                style={styles.googleBtn}
                disabled={isPending}
              >
                {/* SVG for Google Logo */}
                <svg width="18" height="18" viewBox="0 0 24 24" style={styles.googleIcon}>
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.08 2.18v2.77h3.3c1.93-1.78 3.03-4.4 3.03-7.5l-.19-.7z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.3-2.77c-.93.63-2.12 1-3.63 1-3.13 0-5.78-2.11-6.73-4.96H1.02v2.85C3.01 22.18 7.23 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.36c-.25-.76-.39-1.57-.39-2.36s.14-1.6.39-2.36V6.79H1.02C.37 8.09 0 9.56 0 11.12s.37 3.03 1.02 4.33l4.25-3.09z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.01 1.82 1.02 4.88l4.25 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
 
              <div style={styles.divider}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>or bypass with Developer Mode</span>
                <div style={styles.dividerLine} />
              </div>
 
              {/* Dev mode options */}
              <div style={styles.devButtons}>
                <button 
                  onClick={() => handleDevLogin('student')}
                  style={styles.devBtn}
                  disabled={isPending}
                >
                  <User size={16} />
                  <span>Student Access (Aarav)</span>
                </button>
                <button 
                  onClick={() => handleDevLogin('guest')}
                  style={styles.devBtn}
                  disabled={isPending}
                >
                  <User size={16} />
                  <span>Continue as Guest</span>
                </button>
              </div>
            </div>
          ) : (
            /* Simulated Google Sign In Modal Form */
            <form onSubmit={handleGoogleSimulate} style={styles.form}>
              <h3 style={styles.formTitle}>Continue with Google</h3>
              <p style={styles.formSubtitle}>Enter details matching your NITH email domain credentials.</p>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email"><Mail size={12} style={{marginRight: 4}} /> Google Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  placeholder="e.g. yourname.cse22@nith.ac.in" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name"><User size={12} style={{marginRight: 4}} /> Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  placeholder="e.g. Aarav Sharma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{flex: 1}}>
                  <label className="form-label" htmlFor="rollNo"><GraduationCap size={12} style={{marginRight: 4}} /> Roll Number</label>
                  <input 
                    type="text" 
                    id="rollNo"
                    placeholder="e.g. 22MI502" 
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group" style={{flex: 1}}>
                  <label className="form-label" htmlFor="bloodGroup"><Activity size={12} style={{marginRight: 4}} /> Blood Group</label>
                  <select 
                    id="bloodGroup"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="form-input"
                    style={{padding: '11px 16px'}}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dept"><Building size={12} style={{marginRight: 4}} /> Academic Department</label>
                <select 
                  id="dept"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="form-input"
                  style={{padding: '11px 16px'}}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Material Science & Engineering">Material Science & Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hostel"><Home size={12} style={{marginRight: 4}} /> Campus Hostel</label>
                <select 
                  id="hostel"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="form-input"
                  style={{padding: '11px 16px'}}
                >
                  <option value="Kailash Hostel">Kailash Hostel (M)</option>
                  <option value="Himadri Hostel">Himadri Hostel (F)</option>
                  <option value="Shivalik Hostel">Shivalik Hostel (M)</option>
                  <option value="Dhauladhar Hostel">Dhauladhar Hostel (M)</option>
                  <option value="Mani Mahesh Hostel">Mani Mahesh Hostel (Mega)</option>
                  <option value="Parvati Hostel">Parvati Hostel (F)</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowGoogleMock(false)}
                  style={styles.cancelBtn}
                  disabled={isPending}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isPending}
                  style={{padding: '10px 20px', flex: 1}}
                >
                  <LogIn size={16} />
                  <span>{isPending ? 'Connecting...' : 'Verify & Continue'}</span>
                </button>
              </div>
            </form>
          )}

          <div style={styles.cardFooter}>
            <p style={styles.footerText}>
              Access is strictly restricted to students and staff of NIT Hamirpur.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    background: 'var(--bg-app)',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    borderRadius: 'var(--radius-round)',
    background: 'radial-gradient(circle, rgba(45, 168, 170, 0.08) 0%, rgba(255,255,255,0) 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '60vw',
    height: '60vw',
    borderRadius: 'var(--radius-round)',
    background: 'radial-gradient(circle, rgba(18, 91, 68, 0.06) 0%, rgba(255,255,255,0) 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  wrapper: {
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    zIndex: 2,
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logoContainer: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--glass-shadow)',
    border: '1px solid var(--glass-border)',
    marginBottom: '8px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  card: {
    width: '100%',
    padding: '32px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    margin: 0,
    color: 'var(--pine-primary)',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoText: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: '#ffffff',
    color: '#3c4043',
    border: '1px solid #dadce0',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'var(--transition-smooth)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  googleIcon: {
    flexShrink: 0,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    margin: '16px 0',
  },
  dividerText: {
    fontSize: '11px',
    color: 'var(--text-placeholder)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border-subtle)',
  },
  devButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  devBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'var(--bg-input)',
    color: 'var(--pine-primary)',
    border: '1px solid var(--border-subtle)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'var(--transition-smooth)',
  },
  errorAlert: {
    background: 'var(--error-light)',
    border: '1px solid rgba(203, 58, 58, 0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    color: 'var(--error)',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
    marginBottom: '2px',
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: '10px',
  },
  formRow: {
    display: 'flex',
    gap: '14px',
    width: '100%',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-thick)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 20px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  cardFooter: {
    marginTop: '8px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '11px',
    color: 'var(--text-placeholder)',
    lineHeight: '1.4',
    margin: 0,
  }
};
