// server/src/index.ts
import app from "./app";
import { connectToDB } from "./db/connect";
import { ENV } from "./config/env";

async function start() {
  try {
    await connectToDB();
    app.listen(ENV.PORT, "0.0.0.0", () => {     // 👈 important on Render
      console.log(`🚀 Server listening on http://0.0.0.0:${ENV.PORT}`);
      console.log(`🩺 Health check:      /api/health`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

start();
