import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { generateToken } from '@/lib/auth';

// Admin email should be configured in Firebase Authentication
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Only allow admin email to login
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generate JWT token
    const token = generateToken({ email: user.email!, role: 'admin' });

    // Create response with token
    const response = NextResponse.json({ success: true });
    
    // Set HTTP-only cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
} 