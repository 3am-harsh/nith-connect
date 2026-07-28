'use server';

import { 
  getFirestoreLostFoundItems, 
  createFirestoreLostFoundItem,
  seedFirestore
} from '@/lib/firestore';

export async function runSeedingAction() {
  try {
    await seedFirestore();
    return true;
  } catch (error) {
    console.error('Failed to run seeding action:', error);
    return false;
  }
}

export async function fetchLostFoundItems() {
  try {
    return await getFirestoreLostFoundItems();
  } catch (error) {
    console.error('Failed to fetch lost & found items:', error);
    return [];
  }
}

export async function createLostFoundItemAction(
  title: string,
  description: string,
  type: 'lost' | 'found',
  location: string,
  date: string,
  contact: string,
  image: string,
  images: string[],
  userId: string,
  userName: string
) {
  try {
    return await createFirestoreLostFoundItem({
      title,
      description,
      type,
      location,
      date,
      contact,
      image: image || '',
      images: images || [],
      user_id: userId,
      user_name: userName
    });
  } catch (error) {
    console.error('Failed to create lost & found item action:', error);
    return false;
  }
}
