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
    const err = error as any;
    return NextResponse.json({
      success: false,
      message: 'Firestore write failed',
      errorName: err.name || 'Unknown',
      errorCode: err.code || 'No code',
      errorMessage: err.message || String(error),
      stack: err.stack || ''
    }, { status: 500 });
  }
}
