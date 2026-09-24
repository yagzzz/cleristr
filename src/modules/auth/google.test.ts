import { describe, expect, it } from "vitest";
import { createGoogleAuthorizationUrl } from "./google";

describe("createGoogleAuthorizationUrl", () => {
  it("creates an OIDC authorization request with state and PKCE-independent server secret flow", () => {
    const url = new URL(createGoogleAuthorizationUrl({ clientId: "client-id", redirectUri: "https://cleristr.com/api/auth/google/callback", state: "safe-state" }));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("state")).toBe("safe-state");
    expect(url.searchParams.get("scope")).toContain("openid");
  });
});
