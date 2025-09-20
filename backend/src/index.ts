import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors());

app.use(express.json());

connect();

import { userRouter } from "./routes/user.route";
import { captainRouter } from "./routes/captain.route";
import { mapRouter } from "./routes/map.route";
import { rideRouter } from "./routes/ride.route";

app.use("/users",userRouter)
app.use("/captains",captainRouter)
app.use("/maps",mapRouter)
app.use("/rides",rideRouter)

app.get("/", (req, res) => {
    res.send("One piece is Real!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});