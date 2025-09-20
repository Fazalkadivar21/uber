// validation/schemas.ts
import { z } from "zod";

/*
  Reusable primitives
*/
const EMAIL = z
  .string()
  .trim()
  .min(5, { message: "Email is required" })
  .email({ message: "Please provide a valid email address" });

const FULLNAME = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be at most 50 characters" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be at most 50 characters" }),
});

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

const PASSWORD = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be at most 128 characters" })
  .regex(PASSWORD_REGEX, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  });

const PLATE_REGEX = /^[A-Z0-9\-]{1,10}$/i;

const vehicleTypes = ["car", "motorcycle", "auto"] as const;

const VEHICLE_TYPE = z.enum(vehicleTypes)
  .refine((val) => vehicleTypes.includes(val), {
    message: `vehicleType must be one of: ${vehicleTypes.join(", ")}`,
  });

const VEHICLE = z.object({
  color: z
    .string()
    .trim()
    .min(1, { message: "Vehicle color is required" })
    .max(30, { message: "Vehicle color must be at most 30 characters" }),
  plate: z
    .string()
    .trim()
    .regex(PLATE_REGEX, { message: "Vehicle plate format is invalid" }),
  capacity: z
    .number({ message: "Vehicle capacity must be a number" })
    .int({ message: "Vehicle capacity must be an integer" })
    .min(1, { message: "Vehicle capacity must be at least 1" })
    .max(20, { message: "Vehicle capacity seems too large" }),
  vehicleType: VEHICLE_TYPE,
});

export const CoordinatesSchema = z.object({
  lat: z.number().refine((val) => Math.abs(val) <= 90, { message: 'Latitude must be between -90 and 90' }),
  lng: z.number().refine((val) => Math.abs(val) <= 180, { message: 'Longitude must be between -180 and 180' }),
});

const OTP = z
  .string()
  .trim()
  .regex(/^\d{4,6}$/, { message: "OTP must be 4 to 6 digits" });

const OBJECT_ID = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, { message: "Invalid id format" });

/* -----------------------------
   Request body schemas (per endpoint)
   ----------------------------- */

/* USERS */
export const UserRegisterSchema = z.object({
  email: EMAIL,
  fullName: FULLNAME, // <-- updated
  password: PASSWORD,
});

export const UserLoginSchema = z.object({
  email: EMAIL,
  password: z.string().min(1, { message: "Password is required" }),
});

/* CAPTAINS */
export const CaptainRegisterSchema = z.object({
  email: EMAIL,
  fullName: FULLNAME, // <-- updated
  password: PASSWORD,
  vehicle: VEHICLE,
});

export const CaptainLoginSchema = z.object({
  email: EMAIL,
  password: z.string().min(1, { message: "Password is required" }),
});

/* RIDES */
export const RidesCreateSchema = z.object({
  pickup: CoordinatesSchema,  // now an object with lat/lng
  destination: CoordinatesSchema,  // now an object with lat/lng
  vehicleType: VEHICLE_TYPE,
});

export const RidesConfirmSchema = z.object({
  rideId: OBJECT_ID,
});

export const RidesStartRideQuerySchema = z.object({
  rideId: OBJECT_ID,
  otp: OTP,
});

export const RidesEndRideSchema = z.object({
  rideId: OBJECT_ID,
});
