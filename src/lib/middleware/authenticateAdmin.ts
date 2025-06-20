import { getToken } from 'next-auth/jwt';

export async function authenticateAdmin(req: Request) {
  // Holt den JWT-Token aus dem Request (Cookie/Headers)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Wenn kein Token oder Rolle nicht admin → nicht autorisiert
  if (!token || token.role !== 'admin') {
    return { authorized: false };
  }

  // autorisiert, mit User-Daten zurückgeben (optional)
  return { authorized: true, user: token };
}
