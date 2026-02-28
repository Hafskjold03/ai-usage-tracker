import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const { userId } = verifyJwt(token);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}