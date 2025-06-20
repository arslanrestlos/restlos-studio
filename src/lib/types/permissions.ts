// lib/types/permissions.ts

export type Permission =
  | 'marketing'
  | 'management'
  | 'projects'
  | 'accounting'
  | 'hr'
  | 'admin';

export type UserRole = 'user' | 'manager' | 'admin';

export interface UserPermissions {
  marketing: boolean;
  management: boolean;
  projects: boolean;
  accounting: boolean;
  hr: boolean;
  admin: boolean;
}

// Erweiterte User-Interface (für später, wenn wir das User-Model erweitern)
export interface ExtendedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Navigation Item mit Permission
export interface NavItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
  permission?: Permission; // Optional - wenn nicht gesetzt, für alle sichtbar
  adminOnly?: boolean; // Für Admin-only Bereiche
  comingSoon?: boolean; // Für "Demnächst verfügbar"
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Default Permissions für neue User
export const DEFAULT_PERMISSIONS: UserPermissions = {
  marketing: false,
  management: false,
  projects: false,
  accounting: false,
  hr: false,
  admin: false,
};

// Permission Labels für UI
export const PERMISSION_LABELS: Record<Permission, string> = {
  marketing: 'Marketing',
  management: 'Management',
  projects: 'Projekte',
  accounting: 'Buchhaltung',
  hr: 'Personalwesen',
  admin: 'Administration',
};
