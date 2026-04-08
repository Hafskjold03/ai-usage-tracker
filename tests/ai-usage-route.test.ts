/**
 * Unit tests for app/api/ai-usage/route.ts
 * Tests creating and retrieving AI usage logs
 * Maps to: R3 (T6, T7), R5 (T8, T9)
 *
 * next/headers (cookies) and Prisma are fully mocked.
 */

import { POST, GET } from "@/app/api/ai-usage/route";

// ─── Mock next/headers ────────────────────────────────────────────────────────
const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({ get: mockGet })),
}));

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
jest.mock("@/lib/prisma", () => ({
  prisma: {
    aIUsage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// ─── Mock JWT ─────────────────────────────────────────────────────────────────
jest.mock("@/lib/jwt", () => ({
  verifyJwt: jest.fn().mockReturnValue({ userId: 1 }),
}));

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

const mockCreate = prisma.aIUsage.create as jest.Mock;
const mockFindMany = prisma.aIUsage.findMany as jest.Mock;
const mockVerifyJwt = verifyJwt as jest.Mock;

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/ai-usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── POST (create log) ────────────────────────────────────────────────────────
describe("POST /api/ai-usage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no token cookie is present", async () => {
    mockGet.mockReturnValue(undefined);
    const req = makeRequest({ tool: "ChatGPT", purpose: "Writing" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when tool is missing", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest({ purpose: "Writing" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/tool and purpose/i);
  });

  it("returns 400 when purpose is missing", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest({ tool: "ChatGPT" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when the JWT is invalid", async () => {
    mockGet.mockReturnValue({ value: "bad.token" });
    mockVerifyJwt.mockImplementationOnce(() => {
      throw new Error("invalid token");
    });
    const req = makeRequest({ tool: "ChatGPT", purpose: "Writing" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates and returns the AI usage entry on success", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const mockEntry = {
      id: 1,
      userId: 1,
      tool: "ChatGPT",
      purpose: "Writing",
      description: "Draft intro",
      createdAt: new Date().toISOString(),
    };
    mockCreate.mockResolvedValue(mockEntry);

    const req = makeRequest({ tool: "ChatGPT", purpose: "Writing", description: "Draft intro" });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({ tool: "ChatGPT", purpose: "Writing" });
  });

  it("stores the correct userId from the JWT in the new entry", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 42 });
    mockCreate.mockResolvedValue({ id: 2, userId: 42, tool: "Copilot", purpose: "Coding" });

    const req = makeRequest({ tool: "Copilot", purpose: "Coding" });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 42 }),
      })
    );
  });

  it("works without an optional description field", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockCreate.mockResolvedValue({ id: 3, userId: 1, tool: "Bard", purpose: "Research", description: undefined });

    const req = makeRequest({ tool: "Bard", purpose: "Research" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

// ─── GET (retrieve logs) ──────────────────────────────────────────────────────
describe("GET /api/ai-usage", () => {
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

  it("returns an array of AI usage entries for the authenticated user", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    const mockEntries = [
      { id: 1, userId: 1, tool: "ChatGPT", purpose: "Writing", createdAt: new Date().toISOString() },
      { id: 2, userId: 1, tool: "Copilot", purpose: "Coding", createdAt: new Date().toISOString() },
    ];
    mockFindMany.mockResolvedValue(mockEntries);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it("queries only for the authenticated user's entries", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 5 });
    mockFindMany.mockResolvedValue([]);

    await GET();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 5 }),
      })
    );
  });

  it("returns an empty array when the user has no logs", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});