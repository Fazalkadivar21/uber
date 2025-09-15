import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("One piece is Real!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});