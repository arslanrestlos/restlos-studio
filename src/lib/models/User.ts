// lib/models/User.ts

import mongoose, { Document, Model, models, Schema } from 'mongoose';
import { UserPermissions, DEFAULT_PERMISSIONS } from '@/lib/types/permissions';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager'; // Erweitert um 'manager'
  approved: boolean;
  isActive: boolean; // Neu: für Deaktivierung ohne Löschen
  permissions: UserPermissions; // Neu: Permissions Object
  lastLogin?: Date; // Neu: für Analytics
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'manager'],
      default: 'user',
    },
    approved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      marketing: {
        type: Boolean,
        default: DEFAULT_PERMISSIONS.marketing,
      },
      management: {
        type: Boolean,
        default: DEFAULT_PERMISSIONS.management,
      },
      projects: {
        type: Boolean,
        default: DEFAULT_PERMISSIONS.projects,
      },
      accounting: {
        type: Boolean,
        default: DEFAULT_PERMISSIONS.accounting,
      },
      hr: {
        type: Boolean,
        default: DEFAULT_PERMISSIONS.hr,
      },
      admin: {
        type: Boolean,
        default: DEFAULT_PERMISSIONS.admin,
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index für bessere Performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ approved: 1, isActive: 1 });

// Pre-save Middleware: Admin-Role bekommt automatisch alle Permissions
UserSchema.pre('save', function (next) {
  if (this.role === 'admin') {
    this.permissions = {
      marketing: true,
      management: true,
      projects: true,
      accounting: true,
      hr: true,
      admin: true,
    };
  }
  next();
});

// Virtual für Full Name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Instance Methods
UserSchema.methods.hasPermission = function (
  permission: keyof UserPermissions
): boolean {
  return this.permissions[permission] || this.role === 'admin';
};

UserSchema.methods.grantPermission = function (
  permission: keyof UserPermissions
): void {
  this.permissions[permission] = true;
};

UserSchema.methods.revokePermission = function (
  permission: keyof UserPermissions
): void {
  if (this.role !== 'admin') {
    // Admin kann nicht Permissions verlieren
    this.permissions[permission] = false;
  }
};

// Static Methods
UserSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, approved: true });
};

UserSchema.statics.findByPermission = function (
  permission: keyof UserPermissions
) {
  return this.find({
    [`permissions.${permission}`]: true,
    isActive: true,
    approved: true,
  });
};

// Verhindert Neu-Definition beim Hot Reload in Next.js
const User: Model<IUser> =
  models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
