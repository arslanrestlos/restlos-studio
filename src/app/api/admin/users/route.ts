// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { checkAdminPermission } from '@/lib/middleware/checkPermissions';
import { DEFAULT_PERMISSIONS } from '@/lib/types/permissions';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminPermission(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    // Get all users with permissions, ohne password
    const users = await User.find({}, '-password').lean();

    // Ensure all users have permissions field (für alte User)
    const usersWithPermissions = users.map((user) => ({
      ...user,
      permissions:
        user.permissions ||
        (user.role === 'admin'
          ? {
              marketing: true,
              management: true,
              projects: true,
              accounting: true,
              hr: true,
              admin: true,
            }
          : {
              ...DEFAULT_PERMISSIONS,
              marketing: true, // Default für alle
            }),
      isActive: user.isActive ?? true,
    }));

    return NextResponse.json(usersWithPermissions, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminPermission(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      password,
      permissions = DEFAULT_PERMISSIONS,
      isActive = true,
    } = body;

    // Validation
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        {
          error: 'Pflichtfelder: email, firstName, lastName, password',
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email bereits vergeben' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'user',
      approved: true, // Admin-created users are auto-approved
      isActive,
      permissions:
        role === 'admin'
          ? {
              marketing: true,
              management: true,
              projects: true,
              accounting: true,
              hr: true,
              admin: true,
            }
          : permissions,
      password: hashedPassword,
    });

    await newUser.save();

    // Return user without password
    const { password: _, ...userData } = newUser.toObject();

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
