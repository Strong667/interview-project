import { NextResponse } from "next/server";
import { loginUser, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const user = loginUser({ email: body.email ?? "", password: body.password ?? "" });

  if (!user) {
    return NextResponse.json({ error: "Неверный email или пароль." }, { status: 401 });
  }

  await setAuthCookie(user);
  return NextResponse.json({ user });
}
