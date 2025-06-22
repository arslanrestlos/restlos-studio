// lib/models/PendingUser.ts
import mongoose, { Document, Model, models, Schema } from 'mongoose';

export interface IPendingUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  otp: string;
  otpExpires: Date;
  verificationToken: string; // Sicherer Token für URL
  createdAt: Date;
  generateOTP(): string;
  verifyOTP(inputOtp: string): boolean;
  isOTPExpired(): boolean;
}

const PendingUserSchema = new Schema<IPendingUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Bereits gehashed
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
    otp: {
      type: String,
      required: true,
    },
    otpExpires: {
      type: Date,
      required: true,
    },
    verificationToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    // Automatisches Löschen nach 24 Stunden
    expireAfterSeconds: 86400, // 24 Stunden
  }
);

// Indexes für Performance und Sicherheit
PendingUserSchema.index({ verificationToken: 1 });
PendingUserSchema.index({ otpExpires: 1 });

// OTP-Methoden
PendingUserSchema.methods.generateOTP = function (): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minuten
  return otp;
};

PendingUserSchema.methods.verifyOTP = function (inputOtp: string): boolean {
  if (!this.otp || !this.otpExpires) return false;
  if (new Date() > this.otpExpires) return false;
  return this.otp === inputOtp;
};

PendingUserSchema.methods.isOTPExpired = function (): boolean {
  if (!this.otpExpires) return true;
  return new Date() > this.otpExpires;
};

const PendingUser: Model<IPendingUser> =
  models.PendingUser ||
  mongoose.model<IPendingUser>('PendingUser', PendingUserSchema);

export default PendingUser;
