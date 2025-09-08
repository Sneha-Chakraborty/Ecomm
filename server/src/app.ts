// server/src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

app.disable("x-powered-by");
// If deployed behind a proxy (Render/Heroku/etc.), this helps secure cookies work correctly
app.set("trust proxy", 1);

// Parse cookies BEFORE routes
app.use(cookieParser());

// CORS (allow browser to send cookies)
app.use(
  cors({
    origin: true,       // reflect request origin during dev; configure to your domain in prod
    credentials: true,  // allow cookies/authorization headers
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount all API routes
app.use("/api", routes);

// 404 then centralized error handler (order matters)
app.use(notFound);
app.use(errorHandler);

export default app;
