import { createAuth0Client } from "@auth0/auth0-spa-js";

interface AuthProvider {
  isAuthenticated(): Promise<boolean>;
  username(): Promise<null | string>;
  signin(type: "redirect" | "popup", redirectTo: string): Promise<void>;
  handleSigninRedirect(): Promise<void>;
  signout(): Promise<void>;
}

// You probably want these coming from sort of endpoint you can query,
// instead of hardcoded in your application bundle
const AUTH0_DOMAIN = "YOUR-AUTH0-DOMAIN-HERE";
const AUTH0_CLIENT_ID = "YOUR-AUTH0-CLIENT-ID-HERE";

let auth0Client: Awaited<ReturnType<typeof createAuth0Client>>;

async function getClient() {
  if (!auth0Client) {
    auth0Client = await createAuth0Client({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
    });
  }
  return auth0Client;
}

export const auth0AuthProvider: AuthProvider = {
  async isAuthenticated() {
    let client = await getClient();
    return client.isAuthenticated();
  },
  async username() {
    let client = await getClient();
    let user = await client.getUser();
    return user?.name || null;
  },
  async signin(type: string, redirectTo: string) {
    let client = await getClient();
    if (type === "redirect") {
      await client.loginWithRedirect({
        authorizationParams: {
          redirect_uri:
            window.location.origin +
            "/login-result?" +
            new URLSearchParams([["redirectTo", redirectTo]]).toString(),
        },
      });
    } else {
      await client.loginWithPopup();
    }
  },
  async handleSigninRedirect() {
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      let client = await getClient();
      await client.handleRedirectCallback();
    }
  },
  async signout() {
    let client = await getClient();
    await client.logout();
  },
};
