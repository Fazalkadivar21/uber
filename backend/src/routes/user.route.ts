import {regiser,login,getProfile,logout} from "../controllers/user.controller"
import { Router } from "express"
import { authUser } from "../middleware/auth.middleware"

export const userRouter:Router = Router() 

userRouter.post("/register",regiser)
userRouter.post("/login",login)
userRouter.get("/profile",authUser, getProfile)
userRouter.get("/logout",authUser, logout)