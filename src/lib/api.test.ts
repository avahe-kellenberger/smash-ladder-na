import { afterEach, describe, expect, it, vi } from "vitest";
import { hasValidApiToken, withApiToken } from "./api";

const URL = "http://localhost/api/v1/test";
const DEVELOPMENT_TOKEN = "smash-ladder-local-development-token";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("API token authentication", () => {
  it("rejects missing, malformed, and incorrect bearer tokens", () => {
    expect(hasValidApiToken(new Request(URL))).toBe(false);
    expect(hasValidApiToken(new Request(URL, { headers: { Authorization: DEVELOPMENT_TOKEN } }))).toBe(false);
    expect(hasValidApiToken(new Request(URL, { headers: { Authorization: "Bearer wrong" } }))).toBe(false);
  });

  it("accepts the development token outside production", () => {
    expect(hasValidApiToken(new Request(URL, { headers: { Authorization: `Bearer ${DEVELOPMENT_TOKEN}` } }))).toBe(
      true,
    );
  });

  it("uses the configured token when present", () => {
    vi.stubEnv("SMASH_LADDER_API_TOKEN", "configured-secret");
    expect(hasValidApiToken(new Request(URL, { headers: { Authorization: "Bearer configured-secret" } }))).toBe(true);
    expect(hasValidApiToken(new Request(URL, { headers: { Authorization: `Bearer ${DEVELOPMENT_TOKEN}` } }))).toBe(
      false,
    );
  });

  it("has no implicit token in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMASH_LADDER_API_TOKEN", "");
    expect(hasValidApiToken(new Request(URL, { headers: { Authorization: `Bearer ${DEVELOPMENT_TOKEN}` } }))).toBe(
      false,
    );
  });

  it("wraps handlers with the standard JSON unauthorized response", async () => {
    const handler = withApiToken(() => Response.json({ ok: true }));
    const response = await handler(new Request(URL));

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      code: "unauthorized",
      message: "A valid API token is required.",
      retryable: false,
      retry_after_seconds: null,
    });
  });
});
