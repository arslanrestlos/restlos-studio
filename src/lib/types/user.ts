// lib/types/user.ts

import { UserPermissions } from './permissions';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  approved: boolean;
  isActive: boolean;
  permissions: UserPermissions;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  password: string;
  approved: boolean;
  isActive: boolean;
  permissions: UserPermissions;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'user' | 'manager';
  password?: string;
  approved?: boolean;
  isActive?: boolean;
  permissions?: UserPermissions;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  approvedUsers: number;
  adminUsers: number;
  managerUsers: number;
  standardUsers: number;
}
