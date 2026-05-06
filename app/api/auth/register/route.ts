import { NextResponse } from "next/server";
import { registerUser, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; name?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const password = body.password ?? "";

  if (!email || !name || password.length < 6) {
    return NextResponse.json({ error: "Укажите имя, email и пароль от 6 символов." }, { status: 400 });
  }

  try {
    const user = registerUser({ email, name, password });
    await setAuthCookie(user);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Пользователь с таким email уже существует." }, { status: 409 });
  }
}
