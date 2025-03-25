import express, { Application } from "express";
import { errorHandler } from "./utils/errorHandling";
import cookieParser from "cookie-parser";
import redis from "./utils/redis";
import apiRouter from "./index.Routes";
import { ApiDocumentation, PORT } from "./config/env";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";


const app: Application = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173"
}));
app.use(express.urlencoded({ extended: true }));

redis

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// API routes

app.use("/api/v1", apiRouter);

app.get("/", (req: Request, res: Response):any => {
  return res.json({
    message:"welcome to our Application",
    ApiDocumentation :ApiDocumentation,
  })
});

// Handle invalid routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Invalid URL or Method" });
});

app.use(errorHandler);

export default app;
