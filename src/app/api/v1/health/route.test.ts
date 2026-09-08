import { describe, expect, it } from "vitest";
import { GET } from "./route";

const URL = "http://localhost/api/v1/health";
const AUTHORIZATION = { Authorization: "Bearer smash-ladder-local-development-token" };

describe("GET /api/v1/health", () => {
  it("requires an API token", async () => {
    const response = await GET(new Request(URL));
    expect(response.status).toBe(401);
  });

  it("returns the API status", async () => {
    const response = await GET(new Request(URL, { headers: AUTHORIZATION }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok", api_version: "v1" });
  });
});
