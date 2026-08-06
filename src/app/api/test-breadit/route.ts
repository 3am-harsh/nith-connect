import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snap = await getDocs(collection(db, 'breadit_posts'));
    const posts = snap.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts: posts
    });
  } catch (error: unknown) {
    let errorName = 'UnknownName';
    let errorCode = 'UnknownCode';
    let errorMessage = String(error);

    if (error instanceof Error) {
      errorName = error.name;
      errorMessage = error.message;
      if ('code' in error) {
        errorCode = String((error as { code?: unknown }).code);
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch breadit_posts',
      errorName,
      errorCode,
      errorMessage
    }, { status: 500 });
  }
}
