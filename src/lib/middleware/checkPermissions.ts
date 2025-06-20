// lib/middleware/checkPermissions.ts

import { getToken } from 'next-auth/jwt';
import { Permission, UserPermissions } from '@/lib/types/permissions';

interface AuthResult {
  authorized: boolean;
  user?: any;
  message?: string;
}

/**
 * Prüft ob User bestimmte Permission hat
 */
export async function checkPermission(
  req: Request, 
  requiredPermission: Permission
): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return { authorized: false, message: 'Nicht eingeloggt' };
  }

  if (!token.isActive) {
    return { authorized: false, message: 'Account deaktiviert' };
  }

  // Admin hat immer alle Permissions
  if (token.role === 'admin') {
    return { authorized: true, user: token };
  }

  // Permission-Check
  const permissions = token.permissions as UserPermissions;
  if (!permissions || !permissions[requiredPermission]) {
    return { 
      authorized: false, 
      message: `Keine Berechtigung für ${requiredPermission}` 
    };
  }

  return { authorized: true, user: token };
}

/**
 * Prüft ob User eine von mehreren Permissions hat
 */
export async function checkAnyPermission(
  req: Request, 
  requiredPermissions: Permission[]
): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return { authorized: false, message: 'Nicht eingeloggt' };
  }

  if (!token.isActive) {
    return { authorized: false, message: 'Account deaktiviert' };
  }

  // Admin hat immer alle Permissions
  if (token.role === 'admin') {
    return { authorized: true, user: token };
  }

  // Prüfe ob User eine der Permissions hat
  const permissions = token.permissions as UserPermissions;
  if (!permissions) {
    return { authorized: false, message: 'Keine Berechtigungen definiert' };
  }

  const hasPermission = requiredPermissions.some(
    permission => permissions[permission]
  );

  if (!hasPermission) {
    return { 
      authorized: false, 
      message: `Keine Berechtigung für: ${requiredPermissions.join(', ')}` 
    };
  }

  return { authorized: true, user: token };
}

/**
 * Admin-only Check (erweitert deine bestehende authenticateAdmin.ts)
 */
export async function checkAdminPermission(req: Request): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return { authorized: false, message: 'Nicht eingeloggt' };
  }

  if (!token.isActive) {
    return { authorized: false, message: 'Account deaktiviert' };
  }

  // Prüfe Admin-Rolle UND admin-Permission
  const permissions = token.permissions as UserPermissions;
  const isAdmin = token.role === 'admin' || (permissions && permissions.admin);

  if (!isAdmin) {
    return { authorized: false, message: 'Admin-Berechtigung erforderlich' };
  }

  return { authorized: true, user: token };
}

/**
 * Basic Auth-Check (nur eingeloggt)
 */
export async function checkAuthenticated(req: Request): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return { authorized: false, message: 'Nicht eingeloggt' };
  }

  if (!token.isActive) {
    return { authorized: false, message: 'Account deaktiviert' };
  }

  return { authorized: true, user: token };
}

/**
 * Helper für API-Responses
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(
    JSON.stringify({ error: message }), 
    { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export function forbiddenResponse(message = 'Forbidden') {
  return new Response(
    JSON.stringify({ error: message }), 
    { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}