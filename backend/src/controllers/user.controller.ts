import { User } from "../models/user.model";
import { UserLoginSchema, UserRegisterSchema } from "../types";
import { Request, Response } from "express";

export const regiser = async (req: Request, res: Response) => {
  try {
    const parser = UserRegisterSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "Invalid data" });

    const exists = await User.findOne({ email: parser.data.email });
    if (exists) return res.status(400).json({ message: "user exists" });

    const password = await User.hashPassword(parser.data.password);

    const user = await User.create({
      fullName: parser.data.fullName,
      email: parser.data.email,
      password,
    });

    const token = user.generateAuthToken();

    return res
      .status(201)
      .cookie("token", token, { httpOnly: true, secure: true })
      .json({ message: "User created successfully", user, token });
  } catch (error) {
    return res.status(500).json({ message: "Can't create the user." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parser = UserLoginSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "Invalid data" });

    const user = await User.findOne({ email: parser.data.email });
    if (!user) return res.status(404).json({ message: "user not found." });

    const isValid = user.comparePassword(parser.data.password);

    if (!isValid)
      return res.status(403).json({ message: "Invalid email/password." });

    const token = user.generateAuthToken();

    return res
      .status(200)
      .cookie("token", token, { httpOnly: true, secure: true })
      .json({ message: "logged in successfully", user, token });
  } catch (error) {
    return res.status(500).json({ message: "Can't log you in at the moment." });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ user: req.user, message: "User found." });
  } catch (error) {
    return res.status(500).json({ message: "Cant get the user profile." });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log out." });
  }
};