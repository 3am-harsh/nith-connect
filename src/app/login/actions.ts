'use server';

import { redirect } from 'next/navigation';
import { setSession, clearSession, validateNithEmail } from '@/lib/auth';
import { getFirestoreUser, createFirestoreUser, seedFirestore } from '@/lib/firestore';

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginWithEmail(formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const rollNumber = formData.get('rollNumber') as string;
  const department = formData.get('department') as string;
  const hostel = formData.get('hostel') as string;
  const bloodGroup = formData.get('bloodGroup') as string;
  const role = formData.get('role') as string || 'student';

  if (!email || !name) {
    return { success: false, error: 'Email and Name are required.' };
  }

  // Validate email domain restriction
  if (!validateNithEmail(email)) {
    return { 
      success: false, 
      error: 'Access Denied: Only @nith.ac.in Google accounts are allowed to access NITH Connect.' 
    };
  }

  try {
    // Seed Firestore collections in the background if they don't exist yet
    await seedFirestore();

    // Generate a unique ID based on email prefix (replace dots with underscores to prevent sub-paths)
    const userId = email.split('@')[0].replace(/\./g, '_');
    const derivedRollNumber = email.endsWith('@nith.ac.in') ? userId.toUpperCase() : (rollNumber || 'N/A');

    // Check if user already exists in Firestore
    let user = await getFirestoreUser(userId);

    if (!user) {
      // Create new user record in Firestore
      const newUser = {
        id: userId,
        email,
        name,
        roll_number: derivedRollNumber,
        department: department || undefined,
        hostel: hostel || undefined,
        blood_group: bloodGroup || undefined,
        role
      };
      
      await createFirestoreUser(newUser);
      user = newUser;
    }

    // Set the cookie session
    const devEmails = ['sharmaharsh.exe@gmail.com', '25bec047@gmail.com'];
    const finalRole = devEmails.includes(email.toLowerCase()) ? 'developer' : (user.role || 'student');
    await setSession({
      id: userId,
      email: user.email,
      name: user.name,
      roll_number: user.roll_number || derivedRollNumber,
      department: user.department,
      hostel: user.hostel,
      blood_group: user.blood_group,
      role: finalRole
    });

  } catch (error: unknown) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: 'Cloud error occurred during login: ' + message };
  }

  // Redirect to dashboard
  redirect('/');
  return { success: true };
}

export async function loginDeveloper(type: 'student' | 'guest' | 'developer'): Promise<LoginResult> {
  if (type !== 'guest') {
    return { success: false, error: 'Unauthorized bypass attempt.' };
  }

  const mockProfiles = {
    student: {
      id: 'dev_student',
      email: 'aarav.sharma.cse22@nith.ac.in',
      name: 'Aarav Sharma',
      roll_number: '22MI502',
      department: 'Computer Science & Engineering',
      hostel: 'Kailash Hostel',
      blood_group: 'B+',
      role: 'student'
    },
    guest: {
      id: 'dev_guest',
      email: 'guest@nith.ac.in',
      name: 'Campus Guest',
      roll_number: 'GUEST-001',
      department: 'Visitor',
      hostel: 'NITH Guest House',
      blood_group: 'N/A',
      role: 'guest'
    },
    developer: {
      id: '25bec047',
      email: '25bec047@nith.ac.in',
      name: 'Harsh (Developer)',
      roll_number: '25BEC047',
      department: 'Electronics & Communication',
      hostel: 'Himadri Hostel',
      blood_group: 'O+',
      role: 'developer'
    }
  };

  const profile = mockProfiles.guest;

  try {
    // Seed Firestore in the background
    await seedFirestore();

    // Upsert developer profile in Firestore
    const existing = await getFirestoreUser(profile.id);
    if (!existing) {
      await createFirestoreUser(profile);
    }

    await setSession(profile);
  } catch (error: unknown) {
    console.error('Dev login error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: 'Failed to initialize dev profile in Firestore: ' + message };
  }

  redirect('/');
  return { success: true };
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect('/login');
}

export async function checkUserRegisteredAction(email: string): Promise<unknown | null> {
  const userId = email.split('@')[0].replace(/\./g, '_');
  try {
    return await getFirestoreUser(userId);
  } catch (error) {
    console.error('Error checking user registration:', error);
    return null;
  }
}

export async function loginWithFirebaseUserAction(email: string): Promise<LoginResult> {
  const userId = email.split('@')[0].replace(/\./g, '_');
  try {
    const user = await getFirestoreUser(userId);
    if (!user) {
      return { success: false, error: 'User profile not found. Please register.' };
    }
    
    // Set the cookie session
    const devEmails = ['sharmaharsh.exe@gmail.com', '25bec047@gmail.com'];
    const finalRole = devEmails.includes(email.toLowerCase()) ? 'developer' : (user.role || 'student');
    await setSession({
      id: userId,
      email: user.email,
      name: user.name,
      roll_number: user.roll_number || userId.toUpperCase(),
      department: user.department,
      hostel: user.hostel,
      blood_group: user.blood_group,
      role: finalRole
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to set session.' };
  }
  redirect('/');
  return { success: true };
}
