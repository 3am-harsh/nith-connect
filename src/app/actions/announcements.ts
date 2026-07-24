'use server';

import { 
  getFirestoreAnnouncements, 
  createFirestoreAnnouncement, 
  updateAnnouncementLikes, 
  addCommentToAnnouncement,
  type FirestoreComment
} from '@/lib/firestore';

export async function fetchAnnouncements() {
  return getFirestoreAnnouncements();
}

export async function toggleLikeAnnouncement(announcementId: string, userId: string) {
  try {
    const announcements = await getFirestoreAnnouncements();
    const ann = announcements.find(a => a.id === announcementId);
    if (!ann) return false;

    let likes = [...(ann.likes || [])];
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    return updateAnnouncementLikes(announcementId, likes);
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return false;
  }
}

export async function commentAnnouncement(announcementId: string, userId: string, userName: string, text: string) {
  try {
    const announcements = await getFirestoreAnnouncements();
    const ann = announcements.find(a => a.id === announcementId);
    if (!ann) return false;

    const newComment: FirestoreComment = {
      id: Math.random().toString(36).substring(2, 9),
      user_id: userId,
      user_name: userName,
      text,
      created_at: new Date().toISOString()
    };

    const comments = [...(ann.comments || []), newComment];
    return addCommentToAnnouncement(announcementId, comments);
  } catch (error) {
    console.error('Failed to add comment:', error);
    return false;
  }
}

export async function createAnnouncementAction(
  title: string,
  description: string,
  targetAudience: string,
  eventDate: string,
  eventTime: string,
  location: string,
  publisher: string,
  gradientTheme: string
) {
  try {
    return createFirestoreAnnouncement({
      title,
      description,
      target_audience: targetAudience,
      event_date: eventDate,
      event_time: eventTime,
      location,
      status: 'Upcoming',
      publisher,
      gradient_theme: gradientTheme
    });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return false;
  }
}
