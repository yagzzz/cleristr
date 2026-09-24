export function createGoogleAuthorizationUrl({ clientId, redirectUri, state }: { clientId: string; redirectUri: string; state: string }) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: "openid email profile", state, prompt: "select_account" }).toString();
  return url.toString();
}
