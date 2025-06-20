// app/api/user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { DEFAULT_PERMISSIONS } from '@/lib/types/permissions';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    await connectToDB();
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Ensure permissions exist (for migration)
    const permissions =
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
            marketing: true, // Default für alle bestehenden User
          });

    return NextResponse.json({
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role || 'user',
      approved: user.approved ?? false,
      isActive: user.isActive ?? true,
      permissions,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      role,
      password,
      approved,
      permissions,
    } = await req.json();

    await connectToDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === 'admin';

    // Basic info can be updated by anyone
    if (firstName !== undefined) currentUser.firstName = firstName.trim();
    if (lastName !== undefined) currentUser.lastName = lastName.trim();

    // Admin can update additional fields
    if (isAdmin) {
      if (email !== undefined) {
        // Check if email already exists
        const emailExists = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: currentUser._id },
        });
        if (emailExists) {
          return NextResponse.json(
            { error: 'Email ist bereits vergeben' },
            { status: 400 }
          );
        }
        currentUser.email = email.toLowerCase().trim();
      }
      if (role !== undefined) currentUser.role = role;
      if (approved !== undefined) currentUser.approved = approved;
      if (permissions !== undefined) currentUser.permissions = permissions;
    }

    // Password can be changed by user themselves
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      currentUser.password = await bcrypt.hash(password, salt);
    }

    await currentUser.save();

    return NextResponse.json({
      success: true,
      message: 'Profil erfolgreich aktualisiert',
    });
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
