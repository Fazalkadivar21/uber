import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const captainSchema = new mongoose.Schema(
  {
    fullName: {
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    socketId: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: true,
    },
    vehical: {
      color: { type: String, required: true },
      plate: { type: String, required: true },
      capacity: { type: String, required: true },
      vehicleType: {
        type: String,
        enum: ["car", "motorcycle", "auto"],
        required: true,
      },
    },
    location: {
      ltd: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
  return token;
};

captainSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

export const Captain = mongoose.model("Captain", captainSchema);
