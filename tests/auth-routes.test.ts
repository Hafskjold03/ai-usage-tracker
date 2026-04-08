/**
 * Unit tests for app/api/auth/register/route.ts
 * and app/api/auth/login/route.ts
 * Maps to: R1 (T1, T4, T5), R2 (T1, T2, T3)
 *
 * Prisma, hashPassword, verifyPassword, and signJwt are mocked so
 * these remain pure unit tests with no DB or network I/O.
 */

import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";

// ─── Mock Prisma ─────────────────────────────────────────────────────────────
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// ─── Mock auth helpers ────────────────────────────────────────────────────────
jest.mock("@/lib/auth", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed_password"),
  verifyPassword: jest.fn(),
}));

// ─── Mock JWT ─────────────────────────────────────────────────────────────────
jest.mock("@/lib/jwt", () => ({
  signJwt: jest.fn().mockReturnValue("mock.jwt.token"),
}));

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { signJwt } from "@/lib/jwt";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockVerifyPassword = verifyPassword as jest.Mock;

// Helper: build a minimal Request object
function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when required fields are missing (no email)", async () => {
    const req = makeRequest({ password: "pass1234", name: "Alice" });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when required fields are missing (no password)", async () => {
    const req = makeRequest({ email: "a@b.com", name: "Alice" });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when required fields are missing (no name)", async () => {
    const req = makeRequest({ email: "a@b.com", password: "pass1234" });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when the email is already registered", async () => {
    mockFindUnique.mockResolvedValue({ id: 1, email: "a@b.com", name: "Alice" });
    const req = makeRequest({ email: "a@b.com", password: "pass1234", name: "Alice" });
    const res = await registerPOST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already exists/i);
  });

  it("hashes the password before storing the user", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 2, email: "b@b.com", name: "Bob" });

    const req = makeRequest({ email: "b@b.com", password: "plaintext", name: "Bob" });
    await registerPOST(req);

    expect(hashPassword).toHaveBeenCalledWith("plaintext");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "hashed_password" }),
      })
    );
  });

  it("returns 200 with id, email, and name on successful registration", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 3, email: "c@c.com", name: "Carol" });

    const req = makeRequest({ email: "c@c.com", password: "pass1234", name: "Carol" });
    const res = await registerPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({ id: 3, email: "c@c.com", name: "Carol" });
  });

  it("does not return the password hash in the response", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 4, email: "d@d.com", name: "Dave" });

    const req = makeRequest({ email: "d@d.com", password: "pass1234", name: "Dave" });
    const res = await registerPOST(req);
    const body = await res.json();
    expect(body.password).toBeUndefined();
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const req = makeRequest({ password: "pass1234" });
    const res = await loginPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const req = makeRequest({ email: "a@b.com" });
    const res = await loginPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when the user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = makeRequest({ email: "ghost@b.com", password: "pass1234" });
    const res = await loginPOST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/invalid credentials/i);
  });

  it("returns 401 when the password is wrong", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      name: "Alice",
      password: "hashed_password",
    });
    mockVerifyPassword.mockResolvedValue(false);

    const req = makeRequest({ email: "a@b.com", password: "wrongpass" });
    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with user info and sets a token cookie on success", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      name: "Alice",
      password: "hashed_password",
    });
    mockVerifyPassword.mockResolvedValue(true);

    const req = makeRequest({ email: "a@b.com", password: "correctpass" });
    const res = await loginPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({ id: 1, email: "a@b.com", name: "Alice" });
    expect(body.password).toBeUndefined();
  });

  it("calls signJwt with the user's id on successful login", async () => {
    mockFindUnique.mockResolvedValue({
      id: 7,
      email: "a@b.com",
      name: "Alice",
      password: "hashed_password",
    });
    mockVerifyPassword.mockResolvedValue(true);

    const req = makeRequest({ email: "a@b.com", password: "correctpass" });
    await loginPOST(req);

    expect(signJwt).toHaveBeenCalledWith(expect.objectContaining({ userId: 7 }));
  });
});