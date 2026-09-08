import { describe, expect, it } from "vitest";
import { MATCH_DISTANCE_PRESETS, MATCH_REGIONS } from "@/lib/regions";
import { GET } from "./route";

const URL = "http://localhost/api/v1/config";
const AUTHORIZATION = { Authorization: "Bearer smash-ladder-local-development-token" };

describe("GET /api/v1/config", () => {
  it("requires an API token", async () => {
    const response = await GET(new Request(URL));
    expect(response.status).toBe(401);
  });

  it("returns client compatibility and matchmaking options", async () => {
    const response = await GET(new Request(URL, { headers: AUTHORIZATION }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      api_version: "v1",
      minimum_client_version: "0.1.0",
      supported_smash_version: "13.0.5",
      current_season_id: null,
      ranked_available: true,
      rest_poll_interval_seconds: 5,
    });
    expect(body.regions).toHaveLength(MATCH_REGIONS.length);
    expect(body.match_distances).toHaveLength(MATCH_DISTANCE_PRESETS.length);
    expect(body.match_distances.at(-1)).toEqual({
      id: "worldwide",
      label: "Worldwide",
      kilometers: null,
    });
  });
});
