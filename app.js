console.log("🚀 APP STARTED--new change");
import express from "express";
import env from "dotenv";
import cors from "cors";
import connectDB from "./utils/mongodb.js"; // <-- import mongoose connection

import pdfRoute from "./routes/pdfRoute.js";
import sessionRoute from "./routes/sessionRoute.js";
import chatRouter from "./routes/chatRoute.js";

env.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 NEW CODE RUNNING")
// Routes
app.use("/pdf", pdfRoute);
app.use("/session", sessionRoute);
app.use("/chat",chatRouter)


app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Connect MongoDB first, then start server
connectDB()
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // exit if MongoDB connection fails
  });