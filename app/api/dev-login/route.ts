import { NextResponse } from "next/server";
import { DEV_AUTH_COOKIE, DEV_PASSWORD, DEV_USERNAME } from "@/lib/auth/dev-credentials";

type Payload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Payload | null;
  const username = body?.username?.trim();
  const password = body?.password;

  if (username !== DEV_USERNAME || password !== DEV_PASSWORD) {
    return NextResponse.json({ error: "Usuario o contraseña inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
