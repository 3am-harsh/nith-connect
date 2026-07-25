'use server';

import { getFirestoreUser, updateFirestoreUser, FirestoreUser } from '@/lib/firestore';

export async function fetchUserProfile(userId: string): Promise<FirestoreUser | null> {
  return getFirestoreUser(userId);
}

export async function updateUserProfile(userId: string, data: {
  phone_number?: string;
  whatsapp_link?: string;
  instagram_link?: string;
  bio?: string;
}) {
  try {
    return updateFirestoreUser(userId, data);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
}
