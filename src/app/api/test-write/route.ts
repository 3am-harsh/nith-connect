import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      title: 'Diagnostic Test Announcement',
      description: 'Testing firestore connectivity from Vercel server',
      created_at: new Date().toISOString(),
      approved: false,
      likes: [],
      comments: []
    });
    return NextResponse.json({
      success: true,
      message: 'Successfully wrote to Firestore!',
      docId: docRef.id
    });
  } catch (error: unknown) {
    let errorName = 'Unknown';
    let errorCode = 'No code';
    let errorMessage = String(error);
    let errorStack = '';

    if (error instanceof Error) {
      errorName = error.name;
      errorMessage = error.message;
      errorStack = error.stack || '';
      if ('code' in error) {
        errorCode = String((error as { code?: unknown }).code);
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Firestore write failed',
      errorName,
      errorCode,
      errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}
