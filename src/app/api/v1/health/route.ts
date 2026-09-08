import { API_VERSION, apiJson, withApiToken } from "@/lib/api";

export const GET = withApiToken(() =>
  apiJson({
    status: "ok",
    api_version: API_VERSION,
  }),
);
