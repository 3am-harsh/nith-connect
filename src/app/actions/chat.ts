'use server';

import { 
  getFirestoreChatrooms, 
  getFirestoreMessages, 
  createFirestoreMessage 
} from '@/lib/firestore';

export async function fetchChatrooms() {
  return getFirestoreChatrooms();
}

export async function fetchMessages(chatroomId: string) {
  return getFirestoreMessages(chatroomId);
}

export async function sendChatMessage(chatroomId: string, userId: string, userName: string, text: string) {
  try {
    return createFirestoreMessage({
      chatroom_id: chatroomId,
      user_id: userId,
      user_name: userName,
      text: text.trim()
    });
  } catch (error) {
    console.error('Failed to send chat message:', error);
    return false;
  }
}
