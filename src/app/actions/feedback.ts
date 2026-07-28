'use server';

import {
  submitFeedback,
  getFeedbackSubmissions,
  awardVisionaryBadge,
  getUserAchievements,
  type FeedbackSubmission
} from '@/lib/firestore';
import { getSession } from '@/lib/auth';

export async function submitFeedbackAction(suggestion: string, userName: string, userEmail: string) {
  try {
    return await submitFeedback(suggestion, userName, userEmail);
  } catch (error) {
    console.error('Failed to submit feedback action:', error);
    return false;
  }
}

export async function fetchFeedbackSubmissionsAction() {
  try {
    return await getFeedbackSubmissions();
  } catch (error) {
    console.error('Failed to fetch feedback submissions action:', error);
    return [];
  }
}

export async function awardVisionaryBadgeAction(submissionId: string, award: boolean) {
  const session = await getSession();
  if (!session || session.role !== 'developer') {
    throw new Error('Unauthorized');
  }
  try {
    return await awardVisionaryBadge(submissionId, award);
  } catch (error) {
    console.error('Failed to award visionary badge action:', error);
    return false;
  }
}

export async function fetchUserAchievementsAction(userEmail: string) {
  try {
    return await getUserAchievements(userEmail);
  } catch (error) {
    console.error('Failed to fetch achievements action:', error);
    return { pathfinderTier: 0, isVisionary: false };
  }
}
