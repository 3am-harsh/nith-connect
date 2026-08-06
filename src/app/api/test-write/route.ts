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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Firestore write failed',
      errorName: error.name || 'Unknown',
      errorCode: error.code || 'No code',
      errorMessage: error.message || String(error),
      stack: error.stack || ''
    }, { status: 500 });
  }
}
