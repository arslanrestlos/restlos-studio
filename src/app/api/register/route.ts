import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { firstName, lastName, email, password } = await req.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: 'Alle Felder sind erforderlich' },
      { status: 400 }
    );
  }

  await connectToDB();

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json(
      { error: 'E-Mail wird bereits verwendet' },
      { status: 409 }
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    role: 'user', // registrierter User immer mit Rolle user
    password: hashedPassword,
    approved: false, // wartet auf Freischaltung
  });

  await newUser.save();

  return NextResponse.json({
    message:
      'Registrierung erfolgreich. Dein Account wird nach Freigabe aktiviert.',
  });
}
