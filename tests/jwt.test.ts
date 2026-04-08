/**
 * Unit tests for lib/jwt.ts
 * Tests JWT signing and verification
 * Maps to: R1, R2 (token lifecycle underpins authentication)
 */

import { signJwt, verifyJwt } from "@/lib/jwt";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key-for-unit-tests";
});

describe("signJwt", () => {
  it("returns a non-empty string", () => {
    const token = signJwt({ userId: 1 });
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("produces a token with three dot-separated segments (JWT format)", () => {
    const token = signJwt({ userId: 42 });
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("two tokens signed with different payloads are not equal", () => {
    const token1 = signJwt({ userId: 1 });
    const token2 = signJwt({ userId: 2 });
    expect(token1).not.toBe(token2);
  });
});

describe("verifyJwt", () => {
  it("returns the original userId embedded in the token", () => {
    const token = signJwt({ userId: 99 });
    const decoded = verifyJwt(token);
    expect(decoded.userId).toBe(99);
  });

  it("throws for a completely invalid token string", () => {
    expect(() => verifyJwt("not.a.valid.token")).toThrow();
  });

  it("throws for an empty string", () => {
    expect(() => verifyJwt("")).toThrow();
  });

  it("throws for a token signed with a different secret", () => {
    // Sign with a different secret via jsonwebtoken directly
    const jwt = require("jsonwebtoken");
    const badToken = jwt.sign({ userId: 1 }, "wrong-secret", { expiresIn: "7d" });
    expect(() => verifyJwt(badToken)).toThrow();
  });

  it("throws for a token that has expired", () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET!,
      { expiresIn: -1 } // already expired
    );
    expect(() => verifyJwt(expiredToken)).toThrow();
  });
});