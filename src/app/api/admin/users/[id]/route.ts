// app/api/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { checkAdminPermission } from '@/lib/middleware/checkPermissions';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminPermission(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    const id = context.params.id;
    const body = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if email is being changed and already exists
    if (body.email && body.email !== user.email) {
      const emailExists = await User.findOne({
        email: body.email.toLowerCase(),
        _id: { $ne: id }, // Exclude current user
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email ist bereits vergeben' },
          { status: 400 }
        );
      }
    }

    // Update basic fields
    if (body.firstName !== undefined) user.firstName = body.firstName.trim();
    if (body.lastName !== undefined) user.lastName = body.lastName.trim();
    if (body.email !== undefined) user.email = body.email.toLowerCase().trim();

    // Update role
    const allowedRoles = ['admin', 'user', 'manager'];
    if (body.role !== undefined && allowedRoles.includes(body.role)) {
      user.role = body.role;
    }

    // Update status fields
    if (body.approved !== undefined) user.approved = Boolean(body.approved);
    if (body.isActive !== undefined) user.isActive = Boolean(body.isActive);

    // Update permissions (if provided)
    if (body.permissions !== undefined) {
      // If user becomes admin, give all permissions
      if (body.role === 'admin') {
        user.permissions = {
          marketing: true,
          management: true,
          projects: true,
          accounting: true,
          hr: true,
          admin: true,
        };
      } else {
        // Update individual permissions, but remove admin if not admin role
        user.permissions = {
          marketing: Boolean(body.permissions.marketing),
          management: Boolean(body.permissions.management),
          projects: Boolean(body.permissions.projects),
          accounting: Boolean(body.permissions.accounting),
          hr: Boolean(body.permissions.hr),
          admin: body.role === 'admin' ? true : false,
        };
      }
    }

    // Update password if provided
    if (body.password && body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(body.password, salt);
    }

    await user.save();

    // Return user without password
    const { password, ...userData } = user.toObject();

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminPermission(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    const id = context.params.id;

    // Prevent admin from deleting themselves
    if (authResult.user?.id === id) {
      return NextResponse.json(
        { error: 'Sie können sich nicht selbst löschen' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User erfolgreich gelöscht' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
