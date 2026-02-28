import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = verifyJwt(token);
    const now = new Date();
    const monthsToShow = 6;

    // Calculate the start date for the chart
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);

    // Fetch all logs since start date
    const logs = await prisma.aIUsage.findMany({
      where: {
        userId: Number(userId),
        createdAt: { gte: start },
      },
    });

    // Aggregate logs per month
    const aggregate: Record<string, number> = {};
    logs.forEach((log) => {
      const date = new Date(log.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      aggregate[month] = (aggregate[month] || 0) + 1;
    });

    // Build ordered array for last 6 months, zero-filled if needed
    const result: { month: string; count: number }[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      result.push({ month: key, count: aggregate[key] ?? 0 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}