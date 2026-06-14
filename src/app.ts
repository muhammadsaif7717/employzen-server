import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./app/config/cors";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import apiRouter from "./app/routes";

const app: Application = express();

// Parsers & Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Exposed upload folder as static server
app.use("/uploads", express.static("uploads"));

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Employzen API!",
  });
});

// API Routes
app.use("/api/v1", apiRouter);

// Error Handling Middlewares
app.use(notFound);
app.use(globalErrorHandler);

export default app;
