// server/src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { notFound, errorHandler } from "./middleware/error";
import { ENV } from "./config/env"; // make sure ENV has CORS_ORIGIN, NODE_ENV

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // required for secure cookies behind Render

app.use(cookieParser());

// Build an allowlist from env and also allow localhost and Netlify preview URLs
const allowlist = (ENV.CORS_ORIGIN ?? "").split(",").map(s => s.trim()).filter(Boolean);
const isAllowed = (origin?: string) => {
  if (!origin) return true;                              // server-to-server
  if (allowlist.includes(origin)) return true;           // exact matches from env
  if (origin.startsWith("http://localhost:")) return true;
  if (origin.endsWith(".netlify.app")) return true;      // preview deploys
  return false;
};

// CORS with credentials
app.use((req, res, next) => { res.setHeader("Vary", "Origin"); next(); });
app.use(cors({
  origin: (origin, cb) => cb(null, isAllowed(origin) ? origin : false),
  credentials: true,
  methods: ["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health endpoint (Render health checks + quick sanity test)
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", env: ENV.NODE_ENV ?? "dev", time: new Date().toISOString() });
});

// Mount API
app.use("/api", routes);

// 404 & error handler
app.use(notFound);
app.use(errorHandler);

export default app;
