import mongoose, { Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// 1. Shape of the document
interface IVehicle {
  color: string;
  plate: string;
  capacity: string;
  vehicleType: "car" | "motorcycle" | "auto";
}

interface ILocation {
  ltd?: number;
  lng?: number;
}

interface ICaptain {
  fullName: {
    firstName: string;
    lastName?: string;
  };
  email: string;
  password: string;
  socketId?: string;
  status: "active" | "inactive";
  vehical: IVehicle;
  location?: ILocation;
}

// 2. Methods on instances
interface ICaptainMethods {
  generateAuthToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

// 3. Statics on the model
interface CaptainModel extends Model<ICaptain, {}, ICaptainMethods> {
  hashPassword(password: string): Promise<string>;
}

// 4. Schema
const captainSchema = new mongoose.Schema<ICaptain, CaptainModel, ICaptainMethods>(
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

// 5. Instance methods
captainSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};

captainSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// 6. Statics
captainSchema.statics.hashPassword = async function (password: string) {
  return bcrypt.hash(password, 10);
};

// 7. Model
export const Captain = mongoose.model<ICaptain, CaptainModel>("Captain", captainSchema);
