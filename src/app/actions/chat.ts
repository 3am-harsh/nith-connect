'use server';

import { 
  getFirestoreChatrooms, 
  getFirestoreMessages, 
  createFirestoreMessage,
  reportFirestoreMessage,
  getReportedFirestoreMessages,
  dismissFirestoreMessageReports,
  deleteFirestoreMessage,
  banFirestoreUser,
  unbanFirestoreUser,
  isFirestoreUserBanned,
  getBlockedWords,
  addBlockedWord,
  removeBlockedWord
} from '@/lib/firestore';
import { getSession } from '@/lib/auth';

export async function fetchChatrooms() {
  return getFirestoreChatrooms();
}

export async function fetchMessages(chatroomId: string) {
  return getFirestoreMessages(chatroomId);
}

export async function sendChatMessage(chatroomId: string, chatroomName: string, userId: string, userName: string, text: string) {
  try {
    // Check if user is banned
    const banStatus = await isFirestoreUserBanned(userId);
    if (banStatus.banned) {
      return { success: false, banned: true, bannedUntil: banStatus.bannedUntil, reason: banStatus.reason };
    }

    // Check for blocked words
    const textLower = text.toLowerCase();
    const blockedWords = await getBlockedWords();
    const containsBadWord = blockedWords.some(word => {
      const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(textLower);
    });

    if (containsBadWord) {
      return { success: false, containsProfanity: true };
    }

    const success = await createFirestoreMessage({
      chatroom_id: chatroomId,
      chatroom_name: chatroomName,
      user_id: userId,
      user_name: userName,
      text: text.trim()
    });
    return { success };
  } catch (error) {
    console.error('Failed to send chat message:', error);
    return { success: false };
  }
}

export async function reportMessageAction(messageId: string, userId: string) {
  return reportFirestoreMessage(messageId, userId);
}

export async function fetchReportedMessagesAction() {
  const session = await getSession();
  if (!session || (session.role !== 'developer' && session.role !== 'cr')) {
    throw new Error('Unauthorized');
  }
  return getReportedFirestoreMessages();
}

export async function dismissReportsAction(messageId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'developer' && session.role !== 'cr')) {
    throw new Error('Unauthorized');
  }
  return dismissFirestoreMessageReports(messageId);
}

export async function deleteMessageAction(messageId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'developer' && session.role !== 'cr')) {
    throw new Error('Unauthorized');
  }
  return deleteFirestoreMessage(messageId);
}

export async function banUserAction(userId: string, durationHours: number, reason?: string) {
  const session = await getSession();
  if (!session || session.role !== 'developer') {
    throw new Error('Unauthorized');
  }
  // If durationHours is -1, it's a permanent ban (100 years in future)
  const durationMs = durationHours === -1 
    ? 100 * 365 * 24 * 60 * 60 * 1000 
    : durationHours * 60 * 60 * 1000;
  const bannedUntil = new Date(Date.now() + durationMs).toISOString();
  return banFirestoreUser(userId, bannedUntil, reason);
}

export async function unbanUserAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== 'developer') {
    throw new Error('Unauthorized');
  }
  return unbanFirestoreUser(userId);
}

export async function checkUserBanStatusAction(userId: string) {
  return isFirestoreUserBanned(userId);
}

export async function fetchBlockedWordsAction() {
  return getBlockedWords();
}

export async function addBlockedWordAction(word: string) {
  const session = await getSession();
  if (!session || session.role !== 'developer') {
    throw new Error('Unauthorized');
  }
  return addBlockedWord(word);
}

export async function removeBlockedWordAction(word: string) {
  const session = await getSession();
  if (!session || session.role !== 'developer') {
    throw new Error('Unauthorized');
  }
  return removeBlockedWord(word);
}
