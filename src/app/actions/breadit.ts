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

export async function createBreaditPostAction(title: string, content: string, userId: string, userName: string): Promise<string | null> {
  try {
    if (!title.trim() || !content.trim()) return null;
    return await createFirestoreBreaditPost({
      title: title.trim(),
      content: content.trim(),
      user_id: userId,
      user_name: userName
    });
  } catch (error) {
    console.error('Action failed: createBreaditPostAction', error);
    return null;
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

export async function createBreaditCommentAction(postId: string, content: string, userId: string, userName: string): Promise<boolean> {
  try {
    if (!postId || !content.trim()) return false;
    return await createFirestoreBreaditComment({
      post_id: postId,
      content: content.trim(),
      user_id: userId,
      user_name: userName
    });
  } catch (error) {
    console.error('Action failed: createBreaditCommentAction', error);
    return false;
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
