import {
  API_VERSION,
  MINIMUM_CLIENT_VERSION,
  REST_POLL_INTERVAL_SECONDS,
  RULES_REVISION,
  SUPPORTED_SMASH_VERSION,
  apiJson,
  withApiToken,
} from "@/lib/api";
import { MATCH_DISTANCE_PRESETS, MATCH_REGIONS } from "@/lib/regions";

export const GET = withApiToken(() =>
  apiJson({
    api_version: API_VERSION,
    minimum_client_version: MINIMUM_CLIENT_VERSION,
    supported_smash_version: SUPPORTED_SMASH_VERSION,
    current_season_id: null,
    ranked_available: true,
    rest_poll_interval_seconds: REST_POLL_INTERVAL_SECONDS,
    rules_revision: RULES_REVISION,
    regions: MATCH_REGIONS.map((region) => ({ id: region, label: region })),
    match_distances: MATCH_DISTANCE_PRESETS.map(({ label, km }) => ({
      id: km === null ? "worldwide" : String(km),
      label,
      kilometers: km,
    })),
  }),
);
