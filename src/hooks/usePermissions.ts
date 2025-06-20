// hooks/usePermissions.ts (NEU erstellen)

import { useSession } from 'next-auth/react';
import {
  Permission,
  UserPermissions,
  DEFAULT_PERMISSIONS,
} from '@/lib/types/permissions';

export function usePermissions() {
  const { data: session } = useSession();

  // Fallback: Wenn User noch keine permissions hat (alte User), geben wir Admin alles
  const getUserPermissions = (): UserPermissions => {
    if (!session?.user) return DEFAULT_PERMISSIONS;

    // Wenn user.permissions existiert (neue User), verwende diese
    if ('permissions' in session.user && session.user.permissions) {
      return session.user.permissions as UserPermissions;
    }

    // Fallback für bestehende User: Admin bekommt alles, andere erstmal nichts
    // Das können wir später in der DB migrieren
    if (session.user.role === 'admin') {
      return {
        marketing: true,
        management: true,
        projects: true,
        accounting: true,
        hr: true,
        admin: true,
      };
    }

    // Normale User bekommen erstmal nur Marketing (für Testing)
    return {
      ...DEFAULT_PERMISSIONS,
      marketing: true, // Erstmal für alle, später entfernen
    };
  };

  const permissions = getUserPermissions();

  // Hilfsfunktionen
  const hasPermission = (permission: Permission): boolean => {
    return permissions[permission] || false;
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((permission) => hasPermission(permission));
  };

  const isAdmin = (): boolean => {
    return session?.user?.role === 'admin' || hasPermission('admin');
  };

  const canAccessDepartment = (department: Permission): boolean => {
    // Admin kann alles
    if (isAdmin()) return true;

    // Andere brauchen die spezifische Berechtigung
    return hasPermission(department);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    canAccessDepartment,
    user: session?.user,
  };
}

// Helper Hook für einfache Permission-Checks in Components
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

export function useIsAdmin(): boolean {
  const { isAdmin } = usePermissions();
  return isAdmin();
}
