import app from "./app";
import { connectToDB } from "./db/connect";
import { ENV } from "./config/env";

async function start() {
  try {
    await connectToDB();
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${ENV.PORT}`);
      console.log(`🩺 Health check:      http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Helpful global handlers
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

start();
