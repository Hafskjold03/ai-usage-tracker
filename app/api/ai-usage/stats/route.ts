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

    const start = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);

    // Get all logs since start
    const logs = await prisma.aIUsage.findMany({
      where: { userId: Number(userId), createdAt: { gte: start } },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate per month
    const aggregate: Record<string, number> = {};
    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      aggregate[key] = (aggregate[key] || 0) + 1;
    });

    const monthlyStats: { month: string; count: number }[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyStats.push({ month: key, count: aggregate[key] ?? 0 });
    }

    // Total logs
    const totalLogs = await prisma.aIUsage.count({ where: { userId: Number(userId) } });

    // Last 3 logs
    const lastLogs = await prisma.aIUsage.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json({ monthlyStats, totalLogs, lastLogs });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}