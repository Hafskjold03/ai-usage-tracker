/**
 * Unit tests for:
 *   app/api/user/update/route.ts
 *   app/api/user/delete/route.ts
 *   app/api/user/change-password/route.ts
 *
 * Maps to: R10 (T14), R12 (T14, T15)
 */

// ─── Shared mocks ─────────────────────────────────────────────────────────────

const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({ get: mockGet })),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/jwt", () => ({
  verifyJwt: jest.fn().mockReturnValue({ userId: 1 }),
}));

// bcryptjs is used directly in change-password route
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue("new_hashed_password"),
}));

import { PUT as updatePUT } from "@/app/api/user/update/route";
import { DELETE as deleteUser } from "@/app/api/user/delete/route";
import { POST as changePassword } from "@/app/api/user/change-password/route";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import bcrypt from "bcryptjs";

const mockUpdate = prisma.user.update as jest.Mock;
const mockDelete = prisma.user.delete as jest.Mock;
const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockVerifyJwt = verifyJwt as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;

function makeRequest(method: string, body: object): Request {
  return new Request("http://localhost/api/user", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── PUT /api/user/update ─────────────────────────────────────────────────────
describe("PUT /api/user/update", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no token is present", async () => {
    mockGet.mockReturnValue(undefined);
    const req = makeRequest("PUT", { name: "Alice", email: "a@b.com" });
    const res = await updatePUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest("PUT", { email: "a@b.com" });
    const res = await updatePUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest("PUT", { name: "Alice" });
    const res = await updatePUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when the JWT is invalid", async () => {
    mockGet.mockReturnValue({ value: "bad.token" });
    mockVerifyJwt.mockImplementationOnce(() => { throw new Error("invalid"); });
    const req = makeRequest("PUT", { name: "Alice", email: "a@b.com" });
    const res = await updatePUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with updated user info on success", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockUpdate.mockResolvedValue({ id: 1, name: "Alice Updated", email: "new@b.com" });

    const req = makeRequest("PUT", { name: "Alice Updated", email: "new@b.com" });
    const res = await updatePUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ name: "Alice Updated", email: "new@b.com" });
  });

  it("calls prisma.user.update with the correct userId", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 7 });
    mockUpdate.mockResolvedValue({ id: 7, name: "Z", email: "z@z.com" });

    const req = makeRequest("PUT", { name: "Z", email: "z@z.com" });
    await updatePUT(req);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 7 } })
    );
  });

  it("does not return the password field in the response", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockUpdate.mockResolvedValue({ id: 1, name: "Alice", email: "a@b.com" });

    const req = makeRequest("PUT", { name: "Alice", email: "a@b.com" });
    const res = await updatePUT(req);
    const body = await res.json();
    expect(body.password).toBeUndefined();
  });
});

// ─── DELETE /api/user/delete ──────────────────────────────────────────────────
describe("DELETE /api/user/delete", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no token is present", async () => {
    mockGet.mockReturnValue(undefined);
    const res = await deleteUser();
    expect(res.status).toBe(401);
  });

  it("returns 401 when the JWT is invalid", async () => {
    mockGet.mockReturnValue({ value: "bad.token" });
    mockVerifyJwt.mockImplementationOnce(() => { throw new Error("invalid"); });
    const res = await deleteUser();
    expect(res.status).toBe(401);
  });

  it("returns 200 with a success message on valid deletion", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockDelete.mockResolvedValue({});

    const res = await deleteUser();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/deleted/i);
  });

  it("calls prisma.user.delete with the authenticated user's id", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 99 });
    mockDelete.mockResolvedValue({});

    await deleteUser();

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 99 } })
    );
  });

  it("clears the token cookie in the response after deletion", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockDelete.mockResolvedValue({});

    const res = await deleteUser();
    // The Set-Cookie header should expire / clear the token
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/token/i);
    expect(setCookie).toMatch(/max-age=0/i);
  });
});

// ─── POST /api/user/change-password ──────────────────────────────────────────
describe("POST /api/user/change-password", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no token is present", async () => {
    mockGet.mockReturnValue(undefined);
    const req = makeRequest("POST", { currentPassword: "old", newPassword: "newpass1" });
    const res = await changePassword(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when currentPassword is missing", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest("POST", { newPassword: "newpass123" });
    const res = await changePassword(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when newPassword is missing", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest("POST", { currentPassword: "old" });
    const res = await changePassword(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when newPassword is shorter than 8 characters", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    const req = makeRequest("POST", { currentPassword: "oldpass1", newPassword: "short" });
    const res = await changePassword(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/8 characters/i);
  });

  it("returns 401 when the JWT is invalid", async () => {
    mockGet.mockReturnValue({ value: "bad.token" });
    mockVerifyJwt.mockImplementationOnce(() => { throw new Error("invalid"); });
    const req = makeRequest("POST", { currentPassword: "old1234!", newPassword: "newpass123" });
    const res = await changePassword(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when currentPassword does not match the stored hash", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockFindUnique.mockResolvedValue({ password: "stored_hash" });
    mockBcryptCompare.mockResolvedValue(false);

    const req = makeRequest("POST", { currentPassword: "wrongold", newPassword: "newpass123" });
    const res = await changePassword(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/incorrect/i);
  });

  it("returns 200 with a success message when password is changed", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockFindUnique.mockResolvedValue({ password: "stored_hash" });
    mockBcryptCompare.mockResolvedValue(true);
    mockUpdate.mockResolvedValue({});

    const req = makeRequest("POST", { currentPassword: "correctold", newPassword: "newpass123" });
    const res = await changePassword(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/updated/i);
  });

  it("hashes the new password before saving it", async () => {
    mockGet.mockReturnValue({ value: "valid.token" });
    mockVerifyJwt.mockReturnValue({ userId: 1 });
    mockFindUnique.mockResolvedValue({ password: "stored_hash" });
    mockBcryptCompare.mockResolvedValue(true);
    mockUpdate.mockResolvedValue({});

    const req = makeRequest("POST", { currentPassword: "correctold", newPassword: "mynewpass1" });
    await changePassword(req);

    expect(bcrypt.hash).toHaveBeenCalledWith("mynewpass1", 12);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "new_hashed_password" }),
      })
    );
  });
});