import { authCaptain,authUser } from "../middleware/auth.middleware";
import { Router } from "express";
import {createRide,getFare,confirmRide,startRide,endRide, genrateOTP} from "../controllers/ride.controller"

export const rideRouter: Router = Router()

rideRouter.post("/create",authUser,createRide)
rideRouter.get("/get-fare",authUser,getFare)
rideRouter.post("/confirm",authCaptain,confirmRide)
rideRouter.post("/genrate-otp",authCaptain,genrateOTP)
rideRouter.get("/start",authCaptain,startRide)
rideRouter.post("/end",authCaptain,endRide)