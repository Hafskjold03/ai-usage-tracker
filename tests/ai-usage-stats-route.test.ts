/**
 * Unit tests for app/api/ai-usage/stats/route.ts
 * Tests the stats aggregation endpoint
 * Maps to: R5 (T10)
 */

import { GET } from "@/app/api/ai-usage/stats/route";

// ─── Mock next/headers ────────────────────────────────────────────────────────
const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({ get: mockGet })),
}));

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
jest.mock("@/lib/prisma", () => ({
  prisma: {
    aIUsage: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// ─── Mock JWT ─────────────────────────────────────────────────────────────────
jest.mock("@/lib/jwt", () => ({
  verifyJwt: jest.fn().mockReturnValue({ userId: 1 }),
}));

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

const mockFindMany = prisma.aIUsage.findMany as jest.Mock;
const mockCount = prisma.aIUsage.count as jest.Mock;
const mockVerifyJwt = verifyJwt as jest.Mock;

describe("GET /api/ai-usage/stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no token cookie is present", async () => {
    mockGet.mockReturnValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 when the JWT is invalid", async () => {
    mockGet.mockReturnValue({ value: "bad.token" });
    mockVerifyJwt.mockImplementationOnce(() => {
      throw new Error("invalid token");
    });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 200 with monthlyStats, totalLogs, and lastLogs keys", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockFindMany
      .mockResolvedValueOnce([]) // logs for monthly aggregation
      .mockResolvedValueOnce([]); // lastLogs
    mockCount.mockResolvedValue(0);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("monthlyStats");
    expect(body).toHaveProperty("totalLogs");
    expect(body).toHaveProperty("lastLogs");
  });

  it("monthlyStats contains exactly 6 entries (one per month)", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockCount.mockResolvedValue(0);

    const res = await GET();
    const body = await res.json();
    expect(body.monthlyStats).toHaveLength(6);
  });

  it("each monthlyStats entry has a month string and a count number", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockCount.mockResolvedValue(0);

    const res = await GET();
    const { monthlyStats } = await res.json();
    monthlyStats.forEach((entry: { month: string; count: number }) => {
      expect(typeof entry.month).toBe("string");
      expect(entry.month).toMatch(/^\d{4}-\d{2}$/);
      expect(typeof entry.count).toBe("number");
    });
  });

  it("totalLogs reflects the count returned by Prisma", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockCount.mockResolvedValue(17);

    const res = await GET();
    const { totalLogs } = await res.json();
    expect(totalLogs).toBe(17);
  });

  it("lastLogs contains at most 3 entries", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const recent = [
      { id: 3, tool: "C", purpose: "P", createdAt: new Date().toISOString() },
      { id: 2, tool: "B", purpose: "P", createdAt: new Date().toISOString() },
      { id: 1, tool: "A", purpose: "P", createdAt: new Date().toISOString() },
    ];
    mockFindMany
      .mockResolvedValueOnce([]) // aggregation query
      .mockResolvedValueOnce(recent); // lastLogs query
    mockCount.mockResolvedValue(3);

    const res = await GET();
    const { lastLogs } = await res.json();
    expect(lastLogs.length).toBeLessThanOrEqual(3);
  });

  it("months with no logs have count 0", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    // No logs returned → every month bucket should be 0
    mockFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockCount.mockResolvedValue(0);

    const res = await GET();
    const { monthlyStats } = await res.json();
    monthlyStats.forEach((entry: { month: string; count: number }) => {
      expect(entry.count).toBe(0);
    });
  });
});