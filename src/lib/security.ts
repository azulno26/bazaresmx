import crypto from 'crypto';

export function generateToken(id: string, type: 'bazar' | 'expositor', exp: number): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret';
  const payload = `${id}:${type}:${exp}`;
  const signature = crypto.createHmac('sha256', secret)
                          .update(payload)
                          .digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export interface DecodedToken {
  id: string;
  type: 'bazar' | 'expositor';
  exp: number;
}

export function verifyToken(tokenStr: string): DecodedToken | null {
  try {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret';
    const decoded = Buffer.from(tokenStr, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;
    const [id, type, expStr, signature] = parts;
    const exp = parseInt(expStr, 10);
    
    // Verify signature
    const payload = `${id}:${type}:${expStr}`;
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(payload)
                                    .digest('hex');
                                    
    if (signature === expectedSignature) {
      if (type !== 'bazar' && type !== 'expositor') return null;
      return { id, type, exp };
    }
  } catch (e) {
    return null;
  }
  return null;
}
