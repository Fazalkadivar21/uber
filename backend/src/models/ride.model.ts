import mongoose, { Document, Model, Schema } from "mongoose";
import crypto from "crypto";

export interface IRide extends Document {
  user: mongoose.Types.ObjectId;
  captain?: mongoose.Types.ObjectId;
  pickup: string;
  destination: string;
  fare: number;
  status: "pending" | "accepted" | "ongoing" | "completed";
  duration?: number;
  distance?: number;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  otp?: string; // hashed OTP
  otpExpiresAt?: Date;

  generateOTP(length?: number, ttl?: number): string;
  verifyOTP(candidateOtp: string): boolean;
}

export interface IRideModel extends Model<IRide> {}

const rideSchema = new Schema<IRide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    captain: {
      type: Schema.Types.ObjectId,
      ref: "Captain",
    },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    fare: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed"],
      default: "pending",
    },
    duration: { type: Number },
    distance: { type: Number },
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },

    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

rideSchema.methods.generateOTP = function (
  this: IRide,
  length = 6,
  ttl = 300
): string {

  let rawOtp = "";
  for (let i = 0; i < length; i++) {
    rawOtp += crypto.randomInt(0, 10).toString();
  }

  const hash = crypto.createHash("sha256").update(rawOtp).digest("hex");

  this.otp = hash;
  this.otpExpiresAt = new Date(Date.now() + ttl * 1000);

  return rawOtp;
};

rideSchema.methods.verifyOTP = function (this: IRide, candidateOtp: string): boolean {
  if (!this.otp || !this.otpExpiresAt) return false;
  if (Date.now() > this.otpExpiresAt.getTime()) return false; // expired

  const hash = crypto.createHash("sha256").update(candidateOtp).digest("hex");

  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(this.otp, "hex");

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const Ride = mongoose.model<IRide, IRideModel>("Ride", rideSchema);