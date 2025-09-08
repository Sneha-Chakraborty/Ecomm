// server/src/db/connect.ts
import mongoose, { ConnectOptions } from "mongoose";
import { ENV, IS_DEV } from "../config/env";

let connected = false;

export async function connectToDB() {
  if (connected) return mongoose.connection;

  // Minor safety; helps with some query edge-cases
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(ENV.MONGO_URI, {
      autoIndex: IS_DEV, // build indexes in dev only
      serverSelectionTimeoutMS: 10_000,
    } as ConnectOptions);

    connected = true;

    if (IS_DEV) {
      const { host, name } = mongoose.connection;
      console.log(`✅ Mongo connected → ${host}/${name}`);
    }

    // connection lifecycle logs
    mongoose.connection.on("disconnected", () => {
      connected = false;
      if (IS_DEV) console.warn("🟡 Mongo disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      connected = true;
      if (IS_DEV) console.log("🟢 Mongo reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongo connection error:", err);
    });

    return mongoose.connection;
  } catch (err) {
    console.error("❌ Failed to connect to Mongo:", err);
    throw err;
  }
}

export async function disconnectFromDB() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
  if (IS_DEV) console.log("🔌 Mongo disconnected");
}

// Graceful shutdown
async function gracefulExit() {
  try {
    await disconnectFromDB();
    process.exit(0);
  } catch (e) {
    console.error("Error during Mongo disconnect:", e);
    process.exit(1);
  }
}

process.on("SIGINT", gracefulExit);
process.on("SIGTERM", gracefulExit);
