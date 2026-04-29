import { NextResponse } from "next/server";

/**
 * Checks if the request is in tour/demo mode.
 * Tour mode requests carry X-Tour-Mode: true header.
 * API routes should call this before any DB write and return early.
 */
export function isTourRequest(request: Request): boolean {
  return request.headers.get("x-tour-mode") === "true";
}

/**
 * Returns a mock success response for tour mode.
 * Use this in API routes to short-circuit before DB writes.
 */
export function tourMockResponse(data: Record<string, unknown> = {}) {
  return NextResponse.json({ tour: true, ...data }, { status: 200 });
}
