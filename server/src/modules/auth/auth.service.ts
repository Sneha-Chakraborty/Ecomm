// server/src/modules/auth/auth.service.ts
import { User } from "./user.model";
import { hashPassword, verifyPassword } from "../../utils/password";
import { ApiError } from "../../middleware/error";
import type { Document } from "mongoose";

export type PublicUser = { id: string; name: string; email: string };

function toPublicUser(u: any): PublicUser {
  return { id: String(u._id), name: u.name, email: u.email };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();

  const exists = await User.findOne({ email }).lean().exec();
  if (exists) {
    throw new ApiError(409, "Email already in use", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const doc = await User.create({ name: input.name, email, passwordHash });
  return toPublicUser(doc);
}

export async function verifyUser(input: {
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();

  // 🔑 MUST include +passwordHash because the schema has select:false
  const user = (await User.findOne({ email })
    .select("+passwordHash")
    .exec()) as (Document & { _id: any; name: string; email: string; passwordHash: string }) | null;

  if (!user || !user.passwordHash) {
    // tiny delay to avoid timing oracle
    await new Promise((r) => setTimeout(r, 150));
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return toPublicUser(user);
}
