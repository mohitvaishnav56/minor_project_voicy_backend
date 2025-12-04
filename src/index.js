import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config();

const app = express();

connectDB();

app.get("/", (req, res) => {
    res.send("Voicy Backend is running");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});