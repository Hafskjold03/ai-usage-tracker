/**
 * Unit tests for lib/auth.ts
 * Tests password hashing and verification (T1)
 * Maps to: R1, R2
 */

import { hashPassword, verifyPassword } from "@/lib/auth";

describe("hashPassword", () => {
  it("returns a string that is not equal to the plain-text password", async () => {
    const hash = await hashPassword("mysecretpassword");
    expect(hash).not.toBe("mysecretpassword");
  });

  it("returns a bcrypt hash string (starts with $2b$)", async () => {
    const hash = await hashPassword("mysecretpassword");
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it("produces a different hash each time (salt is unique per call)", async () => {
    const hash1 = await hashPassword("samepassword");
    const hash2 = await hashPassword("samepassword");
    expect(hash1).not.toBe(hash2);
  });

  it("handles an empty string without throwing", async () => {
    await expect(hashPassword("")).resolves.toBeDefined();
  });

  it("handles a long password without throwing", async () => {
    const longPassword = "a".repeat(128);
    await expect(hashPassword(longPassword)).resolves.toBeDefined();
  });
});

describe("verifyPassword", () => {
  it("returns true when the plain-text password matches the hash", async () => {
    const password = "correctpassword";
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it("returns false when the plain-text password does not match the hash", async () => {
    const hash = await hashPassword("correctpassword");
    const result = await verifyPassword("wrongpassword", hash);
    expect(result).toBe(false);
  });

  it("returns false for an empty string against a real hash", async () => {
    const hash = await hashPassword("somepassword");
    const result = await verifyPassword("", hash);
    expect(result).toBe(false);
  });

  it("returns false when comparing against an entirely different hash", async () => {
    const hash1 = await hashPassword("password1");
    const result = await verifyPassword("password1", await hashPassword("password2"));
    expect(result).toBe(false);
  });

  it("is case-sensitive — uppercase password does not match lowercase hash", async () => {
    const hash = await hashPassword("password");
    const result = await verifyPassword("PASSWORD", hash);
    expect(result).toBe(false);
  });
});