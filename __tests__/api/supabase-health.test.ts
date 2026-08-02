/** @jest-environment node */

import { GET } from "../../app/api/health/supabase/route";
import { checkSupabaseConnection } from "../../lib/supabase/health";

jest.mock("../../lib/supabase/health", () => ({
  checkSupabaseConnection: jest.fn(),
}));

const mockCheckSupabaseConnection = jest.mocked(checkSupabaseConnection);

afterEach(() => {
  jest.restoreAllMocks();
});

it("returns ok when Supabase is reachable", async () => {
  mockCheckSupabaseConnection.mockResolvedValue();

  const response = await GET();

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: "ok" });
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});

it("returns a generic service error when Supabase is unavailable", async () => {
  const error = new Error("sensitive upstream detail");
  mockCheckSupabaseConnection.mockRejectedValue(error);
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  const response = await GET();

  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toEqual({ status: "error" });
  expect(consoleError).toHaveBeenCalledWith(
    "Supabase health check failed",
    error,
  );
});
