// server/src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"], // explicit origin for dev
    credentials: true,                 // MUST be true for cookies
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
