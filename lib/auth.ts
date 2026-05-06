import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { createUser, getAuthUserByEmail, getUserById, type User } from "@/lib/user-db";

const cookieName = "interview_token";
const secret = process.env.JWT_SECRET ?? "local-dev-secret-change-me";

type JwtPayload = {
  sub: number;
  email: string;
  exp: number;
};

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("base64url")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("base64url");
  return { hash, salt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

export function createJwt(payload: Omit<JwtPayload, "exp">) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  if (sign(`${header}.${body}`) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as JwtPayload;
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload) return null;
  return getUserById(payload.sub);
}

export async function setAuthCookie(user: User) {
  const token = createJwt({ sub: user.id, email: user.email });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete(cookieName);
}

export function registerUser(input: { email: string; name: string; password: string }) {
  const { hash, salt } = hashPassword(input.password);
  return createUser({ email: input.email, name: input.name, passwordHash: hash, passwordSalt: salt });
}

export function loginUser(input: { email: string; password: string }) {
  const user = getAuthUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.password_salt, user.password_hash)) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    accountRole: user.account_role,
    role: user.role,
    stack: user.stack,
    level: user.level,
    createdAt: user.created_at
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.accountRole !== "admin") throw new Error("FORBIDDEN");
  return user;
}
