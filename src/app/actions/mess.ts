'use server';

import { getFirestoreMessMenu } from '@/lib/firestore';

export interface MessMenuData {
  hostel_name: string;
  day_of_week: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

export async function fetchMessMenu(hostelName: string, dayOfWeek: string): Promise<MessMenuData | null> {
  try {
    const menu = await getFirestoreMessMenu(hostelName, dayOfWeek);
    if (!menu) return null;
    
    return {
      hostel_name: menu.hostel_name,
      day_of_week: menu.day_of_week,
      breakfast: menu.breakfast,
      lunch: menu.lunch,
      snacks: menu.snacks,
      dinner: menu.dinner
    };
  } catch (error) {
    console.error('Failed to fetch mess menu from Firestore:', error);
    return null;
  }
}
