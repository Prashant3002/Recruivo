import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Test Firestore connection
    const snapshot = await adminDb.collection('test').get();
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase connection successful'
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}