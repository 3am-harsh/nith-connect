'use server';

import {
  getFirestoreBreaditPosts,
  createFirestoreBreaditPost,
  getFirestoreBreaditComments,
  createFirestoreBreaditComment,
  reportFirestoreBreaditPost,
  reportFirestoreBreaditComment,
  deleteFirestoreBreaditPost,
  deleteFirestoreBreaditComment,
  FirestoreBreaditPost,
  FirestoreBreaditComment
} from '@/lib/firestore';
import { getSession } from '@/lib/auth';

export async function fetchBreaditPostsAction(): Promise<FirestoreBreaditPost[]> {
  try {
    return await getFirestoreBreaditPosts();
  } catch (error) {
    console.error('Action failed: fetchBreaditPostsAction', error);
    return [];
  }
}

export async function createBreaditPostAction(title: string, content: string, userId: string, userName: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    if (!title.trim() || !content.trim()) {
      return { success: false, error: 'Title and content cannot be empty.' };
    }
    const postId = await createFirestoreBreaditPost({
      title: title.trim(),
      content: content.trim(),
      user_id: userId,
      user_name: userName
    });
    return { success: true, postId };
  } catch (error: unknown) {
    console.error('Action failed: createBreaditPostAction', error);
    const err = error as { message?: string };
    return { success: false, error: err?.message || String(error) };
  }
}

export async function fetchBreaditCommentsAction(postId: string): Promise<FirestoreBreaditComment[]> {
  try {
    if (!postId) return [];
    return await getFirestoreBreaditComments(postId);
  } catch (error) {
    console.error('Action failed: fetchBreaditCommentsAction', error);
    return [];
  }
}

export async function createBreaditCommentAction(postId: string, content: string, userId: string, userName: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!postId || !content.trim()) {
      return { success: false, error: 'Post ID and comment content cannot be empty.' };
    }
    const success = await createFirestoreBreaditComment({
      post_id: postId,
      content: content.trim(),
      user_id: userId,
      user_name: userName
    });
    return { success };
  } catch (error: unknown) {
    console.error('Action failed: createBreaditCommentAction', error);
    const err = error as { message?: string };
    return { success: false, error: err?.message || String(error) };
  }
}

export async function reportBreaditPostAction(postId: string, userId: string): Promise<boolean> {
  try {
    if (!postId || !userId) return false;
    return await reportFirestoreBreaditPost(postId, userId);
  } catch (error) {
    console.error('Action failed: reportBreaditPostAction', error);
    return false;
  }
}

export async function reportBreaditCommentAction(commentId: string, userId: string): Promise<boolean> {
  try {
    if (!commentId || !userId) return false;
    return await reportFirestoreBreaditComment(commentId, userId);
  } catch (error) {
    console.error('Action failed: reportBreaditCommentAction', error);
    return false;
  }
}

export async function deleteBreaditPostAction(postId: string): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'developer' && session.role !== 'cr')) {
      throw new Error('Unauthorized');
    }
    return await deleteFirestoreBreaditPost(postId);
  } catch (error) {
    console.error('Action failed: deleteBreaditPostAction', error);
    return false;
  }
}

export async function deleteBreaditCommentAction(commentId: string, postId: string): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'developer' && session.role !== 'cr')) {
      throw new Error('Unauthorized');
    }
    return await deleteFirestoreBreaditComment(commentId, postId);
  } catch (error) {
    console.error('Action failed: deleteBreaditCommentAction', error);
    return false;
  }
}
