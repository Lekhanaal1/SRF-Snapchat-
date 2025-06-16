import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function verifyAuth(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateToken(payload: { email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
} 