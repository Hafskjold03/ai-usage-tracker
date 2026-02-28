import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tool, purpose, description } = await req.json();

  if (!tool || !purpose) {
    return NextResponse.json({ error: "Tool and purpose are required" }, { status: 400 });
  }

  try {
    const { userId } = verifyJwt(token);

    const entry = await prisma.aIUsage.create({
      data: {
        userId: Number(userId), // ensure it's Int
        tool,
        purpose,
        description,
      },
    });

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = verifyJwt(token);

    const entries = await prisma.aIUsage.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}