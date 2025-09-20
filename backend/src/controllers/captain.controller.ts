import { Captain } from "../models/captain.model";
import { Request, Response } from "express";
import { CaptainLoginSchema, CaptainRegisterSchema } from "../types";

export const register = async (req: Request, res: Response) => {
  try {
    const parser = CaptainRegisterSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "Inavalid data." });

    const exists = await Captain.findOne({ email: parser.data.email });
    if (!exists) return res.status(400).json({ message: "Captain exists" });

    const password = Captain.hashPassword(parser.data.password);

    const captain = await Captain.create({
      email: parser.data.email,
      fullName: parser.data.fullName,
      password,
      vehical: parser.data.vehicle,
    });

    const token = captain.generateAuthToken();

    return res
      .status(200)
      .cookie("token", token, { httpOnly: true, secure: true })
      .json({ message: "Captain created", captain, token });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parser = CaptainLoginSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "Invalid data." });

    const captain = await Captain.findOne({ email: parser.data.email });
    if (!captain)
      return res.status(404).json({ message: "Captain does not exist" });

    const isValid = captain.comparePassword(parser.data.password);
    if (!isValid)
      return res.status(403).json({ message: "Invalid email/password" });

    const token = captain.generateAuthToken();

    return res
      .status(200)
      .cookie("token", token, { httpOnly: true, secure: true })
      .json({ message: "Login successfull", captain, token });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login." });
  }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        return res.status(200).json({user: req.captain,message : "Profile fetched"})
    } catch (error) {
        return res.status(500).json({message:"Failed getting the profile"})
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token",{httpOnly:true,secure:true})
        return res.status(200).json({message: "Logged out."})
    } catch (error) {
        return res.status(500).json({message: "Failed to logout."})
    }
};
