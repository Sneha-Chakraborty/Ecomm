import { api } from "./client";
import type { SignupRequest } from "../validation/auth";
import type { LoginRequest } from "../validation/auth";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
};

/** ---------- Signup ---------- */
export async function signup(payload: SignupRequest): Promise<UserDTO> {
  const res = await api.post("/auth/signup", payload);
  return res.data.user as UserDTO;
}

/** ---------- Login (sets HttpOnly cookie) ---------- */
export async function login(payload: LoginRequest): Promise<UserDTO> {
  const res = await api.post("/auth/login", payload);
  return res.data.user as UserDTO;
}

/** ---------- Me (reads from cookie session) ---------- */
export async function me(): Promise<UserDTO> {
  const res = await api.get("/auth/me");
  return res.data.user as UserDTO;
}

/** ---------- Logout (clears cookie) ---------- */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
