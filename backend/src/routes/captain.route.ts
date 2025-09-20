import {regiser,login,getProfile,logout} from "../controllers/captain.controller"
import { Router } from "express"
import { authCaptain } from "../middleware/auth.middleware"

export const captainRouter:Router = Router() 

captainRouter.post("/register",regiser)
captainRouter.post("/login",login)
captainRouter.get("/profile",authCaptain, getProfile)
captainRouter.get("/logout",authCaptain, logout)