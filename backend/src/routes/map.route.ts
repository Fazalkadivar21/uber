import { authUser } from "../middleware/auth.middleware";
import { Router } from "express";
import {getCoordinates,getDistanceTime,getSuggestions} from "../controllers/map.controller"

export const mapRouter: Router = Router()

mapRouter.get("/get-coordinates",authUser,getCoordinates)
mapRouter.get("/get-distance-time",authUser,getDistanceTime)
mapRouter.get("/get-suggestion",authUser,getSuggestions)
