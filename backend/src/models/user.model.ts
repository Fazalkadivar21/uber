// models/user.model.ts
import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1. Shape of the document
interface IUser {
  fullName: {
    firstName: string;
    lastName?: string;
  };
  email: string;
  password: string;
  socketId?: string;
}

// 2. Methods on instances
interface IUserMethods {
  generateAuthToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

// 3. Statics on model
interface UserModel extends Model<IUser, {}, IUserMethods> {
  hashPassword(password: string): Promise<string>;
}

// 4. Schema
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  fullName: {
    firstName: {
      type: String,
      required: true,
      minlength: [3, "First name must be at least 3 characters long"],
    },
    lastName: {
      type: String,
      minlength: [3, "Last name must be at least 3 characters long"],
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, "Email must be at least 5 characters long"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  socketId: {
    type: String,
  },
});

// 5. Instance methods
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// 6. Statics
userSchema.statics.hashPassword = async function (password: string) {
  return bcrypt.hash(password, 10);
};

// 7. Model
export const User = mongoose.model<IUser, UserModel>("User", userSchema);
