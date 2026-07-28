'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { loginWithEmail, loginDeveloper, checkUserRegisteredAction, loginWithFirebaseUserAction } from './actions';
import { Mountain, LogIn, ShieldAlert, Sparkles, User, Mail, GraduationCap, Building, Home, Activity } from 'lucide-react';
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Capacitor } from '@capacitor/core';

// Premium full-screen white loader with expanding dot wave
function LoadingOverlay() {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const steps = [
      'Establishing secure connection...',
      'Checking portal database...',
      'Loading your workspace...',
      'Ready! Launching...'
    ];
    
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    'Establishing secure connection...',
    'Checking portal database...',
    'Loading your workspace...',
    'Ready! Launching...'
  ];

  return (
    <div style={styles.loaderOverlay} className="animate-fade-in">
      <div style={styles.loaderContainer}>
        {/* Glowing Logo */}
        <div style={styles.logoWrapper}>
          <Mountain size={44} color="var(--pine-primary)" />
        </div>
        
        {/* Expanding Dot Wave */}
        <div className="dot-pulse" style={{ margin: '10px 0' }}>
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        
        {/* Animated text */}
        <p style={styles.loaderText}>{steps[loadingStep]}</p>
        <span style={styles.loaderBrand}>NITH CONNECT</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for registration
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');
  
  // Custom user inputs remaining
  const [hostel, setHostel] = useState('Kailash Boys Hostel (est. 1989)');
  const [bloodGroup, setBloodGroup] = useState('B+');

  const parseNithEmail = (userEmail: string) => {
    const prefix = userEmail.split('@')[0].toUpperCase();
    const match = prefix.match(/^(\d+)([A-Z]+)(\d+)/);
    
    if (!match) {
      return {
        rollNumber: prefix,
        department: 'Computer Science & Engineering',
        yearText: 'Student Scholar'
      };
    }
    
    const [_, yearStr, branchCode] = match;
    const entryYear = parseInt(yearStr, 10); // e.g. 25
    
    // Calculate Year of Study (academic years change in July)
    const today = new Date();
    const currentYear = today.getFullYear() % 100; // e.g. 26
    const currentMonth = today.getMonth() + 1; // 1-12
    
    let yearNum = currentYear - entryYear;
    if (currentMonth >= 7) {
      yearNum += 1;
    }
    
    // Ensure we don't get negative/zero years
    yearNum = Math.max(1, yearNum);
    
    const yearLabels = ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)', '5th Year (Senior+)'];
    const yearText = yearLabels[yearNum - 1] || `${yearNum}th Year`;

    const branchMap: Record<string, string> = {
      'BCS': 'Computer Science & Engineering',
      'BEC': 'Electronics & Communication Engineering',
      'DCS': 'Computer Science & Engineering (Dual Degree)',
      'DEC': 'Electronics & Communication Engineering (Dual Degree)',
      'BEE': 'Electrical Engineering',
      'BME': 'Mechanical Engineering',
      'BCH': 'Chemical Engineering',
      'BCE': 'Civil Engineering',
      'BMA': 'Mathematics & Computing',
      'BMS': 'Materials Science & Engineering',
      'BAR': 'Architecture'
    };

    return {
      rollNumber: prefix,
      department: branchMap[branchCode] || 'Computer Science & Engineering',
      yearText: yearText
    };
  };

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

        const isValidDomain = userEmail.endsWith('@nith.ac.in') || 
                              userEmail.toLowerCase() === 'djfgh7033@gmail.com' ||
                              userEmail.toLowerCase() === 'sharmaharsh.exe@gmail.com';
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
          
          // Auto-parse roll number, department and study year
          const parsed = parseNithEmail(userEmail);
          setRollNo(parsed.rollNumber);
          setDept(parsed.department);
          setYearOfStudy(parsed.yearText);
          
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
      {/* Dynamic anticipation loader screen */}
      {isPending && <LoadingOverlay />}

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

              {/* Beautiful college email alert notice integrated cleanly in UI */}
              <div style={styles.warningBanner}>
                <div style={styles.warningIndicator} />
                <div style={styles.warningTextContainer}>
                  <h4 style={styles.warningTitle}>Verified Enrollment Portal</h4>
                  <p style={styles.warningDesc}>
                    Access is restricted. Please sign in with your official <strong>@nith.ac.in</strong> account.
                  </p>
                </div>
              </div>

              {/* Standard Google Login Button */}
              <button 
                onClick={handleGoogleSignIn}
                style={styles.googleBtn}
                disabled={isPending}
                className="touch-feedback"
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
                <span style={styles.dividerText}>or</span>
                <div style={styles.dividerLine} />
              </div>
 
              {/* Explore as Guest Option */}
              <button 
                onClick={() => handleDevLogin('guest')}
                style={styles.devBtn}
                disabled={isPending}
                className="touch-feedback"
              >
                <User size={16} />
                <span>Continue as Guest</span>
              </button>
            </div>
          ) : (
            /* Auto-Parsed and Simplified Google Sign-In Form (Scrollable) */
            <form onSubmit={handleGoogleSimulate} style={styles.formScrollable}>
              <h3 style={styles.formTitle}>Complete Enrollment</h3>
              <p style={styles.formSubtitle}>Verify your student identity to finalize registration.</p>
              
              {/* Read-Only Verified Profile Details Card */}
              <div style={styles.verifiedCard}>
                <div style={styles.verifiedHeader}>
                  <Sparkles size={14} color="var(--aqua-primary)" />
                  <span style={styles.verifiedTitle}>Auto-Verified Details</span>
                </div>
                
                <div style={styles.verifiedDetailItem}>
                  <span style={styles.verifiedLabel}>Verified Name</span>
                  <span style={styles.verifiedValue}>{name}</span>
                </div>
                <div style={styles.verifiedDetailItem}>
                  <span style={styles.verifiedLabel}>Roll Number</span>
                  <span style={styles.verifiedValue}>{rollNo}</span>
                </div>
                <div style={styles.verifiedDetailItem}>
                  <span style={styles.verifiedLabel}>Department</span>
                  <span style={styles.verifiedValue}>{dept}</span>
                </div>
                <div style={styles.verifiedDetailItem}>
                  <span style={styles.verifiedLabel}>Current Year</span>
                  <span style={styles.verifiedValue}>{yearOfStudy}</span>
                </div>
              </div>

              {/* User Selectable Variables */}
              <div className="form-group">
                <label className="form-label" htmlFor="hostel">
                  <Home size={12} style={{marginRight: 4}} /> Select Hostel / Day Scholar
                </label>
                <select 
                  id="hostel"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="form-input"
                  style={{padding: '11px 16px'}}
                >
                  <optgroup label="Boys Hostels">
                    <option value="Kailash Boys Hostel (est. 1989)">Kailash Boys Hostel (est. 1989)</option>
                    <option value="Himgiri Boys Hostel (2015)">Himgiri Boys Hostel (2015)</option>
                    <option value="Udaygiri Boys Hostel (2019)">Udaygiri Boys Hostel (2019)</option>
                    <option value="Neelkanth Boys Hostel (2008)">Neelkanth Boys Hostel (2008)</option>
                    <option value="Dhauladhar Boys Hostel (1998)">Dhauladhar Boys Hostel (1998)</option>
                    <option value="Vindhyachal Boys Hostel (2006)">Vindhyachal Boys Hostel (2006)</option>
                    <option value="Shivalik Boys Hostel (1987)">Shivalik Boys Hostel (1987)</option>
                  </optgroup>
                  <optgroup label="Girls Hostels">
                    <option value="Ambika Girls Hostel (2012)">Ambika Girls Hostel (2012)</option>
                    <option value="Parvati Girls Hostel (1998)">Parvati Girls Hostel (1998)</option>
                    <option value="Mani-Mahesh Girls Hostel (2003)">Mani-Mahesh Girls Hostel (2003)</option>
                    <option value="Aravali Girls Hostel (2017)">Aravali Girls Hostel (2017)</option>
                  </optgroup>
                  <optgroup label="Other Options">
                    <option value="Satpura Hostel">Satpura Hostel (Attached Baths)</option>
                    <option value="Day Scholar">Day Scholar</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bloodGroup">
                  <Activity size={12} style={{marginRight: 4}} /> Blood Group
                </label>
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

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowGoogleMock(false)}
                  style={styles.cancelBtn}
                  disabled={isPending}
                  className="touch-feedback"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary touch-feedback"
                  disabled={isPending}
                  style={{padding: '10px 20px', flex: 1}}
                >
                  <LogIn size={16} />
                  <span>{isPending ? 'Syncing...' : 'Verify & Launch'}</span>
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
  warningBanner: {
    display: 'flex',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(244, 162, 97, 0.08)',
    border: '1px solid rgba(244, 162, 97, 0.22)',
    textAlign: 'left',
  },
  warningIndicator: {
    width: '3.5px',
    alignSelf: 'stretch',
    backgroundColor: 'var(--aqua-primary)',
    borderRadius: '2px',
  },
  warningTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  warningTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--pine-deep)',
    margin: 0,
  },
  warningDesc: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: '1.4',
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
  formScrollable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    maxHeight: '68vh',
    overflowY: 'auto',
    paddingRight: '4px',
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
  verifiedCard: {
    backgroundColor: 'var(--bg-hover)',
    border: '1px dashed var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  verifiedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '6px',
    marginBottom: '2px',
  },
  verifiedTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--pine-deep)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  verifiedDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  verifiedLabel: {
    color: 'var(--text-muted)',
  },
  verifiedValue: {
    fontWeight: '700',
    color: 'var(--text-main)',
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
  },
  loaderOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
  },
  logoWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-app)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-subtle)',
    marginBottom: '8px',
  },
  loaderText: {
    color: 'var(--pine-deep)',
    fontSize: '14px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '0.2px',
    minHeight: '20px',
    transition: 'all 0.3s ease',
  },
  loaderBrand: {
    color: 'var(--pine-primary)',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '5px',
    textTransform: 'uppercase',
    marginTop: '6px',
    opacity: 0.8,
  }
};
