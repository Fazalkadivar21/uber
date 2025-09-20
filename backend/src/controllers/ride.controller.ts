import { Request, Response } from "express";
import {
  RidesConfirmSchema,
  RidesCreateSchema,
  RidesEndRideSchema,
  RidesStartRideQuerySchema,
} from "../types";
import { Ride } from "../models/ride.model";
import { MapService } from "../service/map.service";
import { parse } from "path";

interface Query {
  pickup: { lat: string; lng: string };
  destination: { lat: string; lng: string };
}

const calcFare = async (
  pickup: { lat: number; lng: number },
  drop: { lat: number; lng: number }
) => {
  const mapService = new MapService(process.env.MAPBOX_API_KEY!);
  const { distance, duration } = await mapService.getDistanceTime(pickup, drop);

  const [baseAuto, baseCar, baseMotorcycle] = [30, 50, 20];

  const fare = {
    auto: baseAuto * Number(distance),
    car: baseCar * Number(distance),
    motorcycle: baseMotorcycle * Number(distance),
  };

  return { fare, duration };
};

export const createRide = async (req: Request, res: Response) => {
  try {
    const parser = RidesCreateSchema.safeParse(req.body);
    if (!parser.success)
      return res
        .status(400)
        .json({ message: "Invalid/Incomplete data recived." });

    const { fare, duration } = await calcFare(
      parser.data.pickup,
      parser.data.destination
    );

    const ride = await Ride.create({
      user: req.user,
      pickup: parser.data.pickup,
      destination: parser.data.destination,
      fare: fare[parser.data.vehicleType],
      duration,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create ride" });
  }
};

export const getFare = async (req: Request, res: Response) => {
  try {
    //get /api?pickip[lat]=x&pickup[lng]=y&destination[lat]=x&destination[lng]=y
    const { pickup, destination } = req.query as unknown as Query;

    const pickupCoords = {
      lat: parseFloat(pickup.lat),
      lng: parseFloat(pickup.lng),
    };

    const destinationCoords = {
      lat: parseFloat(destination.lat),
      lng: parseFloat(destination.lng),
    };

    if (!(pickupCoords && destinationCoords))
      return res.status(400).json({ message: "Invalid/incomplete data" });

    const { fare } = await calcFare(pickupCoords, destinationCoords);

    return res.status(200).json({ message: "Fare fetched", fare });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get fare" });
  }
};

export const confirmRide = async (req: Request, res: Response) => {
  try {
    const parser = RidesConfirmSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "invalid data" });

    const ride = await Ride.findOneAndUpdate(
      { _id: parser.data.rideId },
      {
        captain: req.captain,
        status: "accepted",
      },
      { new: true }
    );

    return res.status(200).json({ message: "Ride confirmed", ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to confirm ride" });
  }
};

export const genrateOTP = async (req: Request, res: Response) => {
  try {
    const parser = RidesConfirmSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "invalid data" });

    const ride = await Ride.findById(parser.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const otp = ride.generateOTP(6, 300);
    await ride.save();

    return res.status(200).json({ message: "Otp sent" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to genrate otp" });
  }
};

export const startRide = async (req: Request, res: Response) => {
  try {
    const parser = RidesStartRideQuerySchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "Invalid data" });

    const ride = await Ride.findById(parser.data.rideId).select(
      "+otp +otpExpiresAt"
    );
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const isValid = ride.verifyOTP(parser.data.otp);
    if (!isValid)
      return res.status(403).json({ message: "Invalid or expired OTP" });

    ride.status = "ongoing";
    await ride.save();

    return res.status(200).json({ message: "Ride started" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to start ride" });
  }
};

export const endRide = async (req: Request, res: Response) => {
  try {
    const parser = RidesEndRideSchema.safeParse(req.body);
    if (!parser.success)
      return res.status(400).json({ message: "Invalid data" });

    const ride = await Ride.findByIdAndUpdate(
      parser.data.rideId,
      {
        status: "completed",
      },
      { new: true }
    );

    return res.status(200).json({ message: "Ride completed." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to end ride" });
  }
};
