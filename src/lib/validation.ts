// Shared request validation schemas for RepoRadar API routes.
// Keeping limits here prevents oversized or malformed payloads from reaching
// GitHub, Ollama, or the database.

import { z } from "zod";

export const MAX_CHAT_MESSAGE_LENGTH = 2000;
export const MAX_DISCOVER_LIMIT = 30;

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(
      MAX_CHAT_MESSAGE_LENGTH,
      `Message must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer`
    ),
});

export const discoverRequestSchema = z.object({
  query: z.string().trim().max(200, "Query must be 200 characters or fewer").optional(),
  topic: z.string().trim().max(100, "Topic must be 100 characters or fewer").optional(),
  language: z
    .string()
    .trim()
    .max(100, "Language must be 100 characters or fewer")
    .optional(),
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(MAX_DISCOVER_LIMIT, `Limit must be ${MAX_DISCOVER_LIMIT} or fewer`)
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type DiscoverRequest = z.infer<typeof discoverRequestSchema>;

export function formatValidationIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "body";
    return `${path}: ${issue.message}`;
  });
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
