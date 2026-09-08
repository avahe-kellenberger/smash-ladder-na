import { timingSafeEqual } from "node:crypto";

const DEVELOPMENT_API_TOKEN = "smash-ladder-local-development-token";

export const API_VERSION = "v1";
export const MINIMUM_CLIENT_VERSION = "0.1.0";
export const SUPPORTED_SMASH_VERSION = "13.0.5";
export const REST_POLL_INTERVAL_SECONDS = 5;
export const RULES_REVISION = "2026-09-04";

type ApiHandler = (request: Request) => Response | Promise<Response>;

export type ApiErrorBody = {
  code: string;
  message: string;
  retryable: boolean;
  retry_after_seconds: number | null;
};

export function apiJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(body, { ...init, headers });
}

export function apiError(code: string, message: string, status: number, retryable = false) {
  const body: ApiErrorBody = {
    code,
    message,
    retryable,
    retry_after_seconds: null,
  };
  return apiJson(body, { status });
}

function expectedApiToken() {
  const configured = process.env.SMASH_LADDER_API_TOKEN?.trim();
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_API_TOKEN;
}

export function hasValidApiToken(request: Request) {
  const expected = expectedApiToken();
  if (!expected) return false;

  const authorization = request.headers.get("Authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  if (!match) return false;

  const candidate = new TextEncoder().encode(match[1]);
  const reference = new TextEncoder().encode(expected);
  if (candidate.length !== reference.length) return false;
  return timingSafeEqual(candidate, reference);
}

export function withApiToken(handler: ApiHandler): ApiHandler {
  return async (request) => {
    if (!hasValidApiToken(request)) {
      return apiError("unauthorized", "A valid API token is required.", 401);
    }
    return handler(request);
  };
}
