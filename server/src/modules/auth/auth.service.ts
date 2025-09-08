// server/src/modules/auth/auth.service.ts
import { User, type UserDocument } from "./user.model";
import type { SignupBody, LoginBody } from "./auth.types";
import { hashPassword, verifyPassword } from "../../utils/password";
import { ApiError } from "../../middleware/error";

/** What we return to clients (never include passwordHash) */
export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

function toPublicUser(u: UserDocument): PublicUser {
  return { id: u._id.toString(), name: u.name, email: u.email };
}

/**
 * Create a new user (signup)
 * - Ensures email is unique
 * - Hashes password
 * - Returns public fields only
 */
export async function createUser(input: SignupBody): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new ApiError(409, "Email already in use", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash,
  });

  return toPublicUser(user);
}

/**
 * Verify credentials (login)
 * - Finds user by email
 * - Compares password (bcrypt)
 * - Returns public user on success
 * - Throws 401 on failure
 */
export async function verifyUser(input: LoginBody): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();
  const user = await User.findOne({ email });

  // Do not reveal which field failed (email vs password)
  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return toPublicUser(user);
}
