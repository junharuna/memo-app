import nextConfig from "@/next.config";

it("全レスポンスに基本的なセキュリティヘッダーを設定する", async () => {
  const headers = await nextConfig.headers?.();
  const securityHeaders = headers?.find(({ source }) => source === "/:path*")?.headers;

  expect(securityHeaders).toEqual(
    expect.arrayContaining([
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ]),
  );
  expect(nextConfig.poweredByHeader).toBe(false);
});
