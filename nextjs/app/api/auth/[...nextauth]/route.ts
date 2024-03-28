import NextAuth, { Profile, User } from "next-auth"
import KeycloakProvider, { KeycloakProfile } from "next-auth/providers/keycloak";
import { OAuthConfig } from "next-auth/providers/oauth";

// https://next-auth.js.org/v3/tutorials/refresh-token-rotation
// https://github.com/nextauthjs/next-auth-refresh-token-example/blob/main/pages/api/auth/%5B...nextauth%5D.js
// https://gist.github.com/degitgitagitya/db5c4385fc549f317eac64d8e5702f74


const refreshAccessToken = async (token: any, provider: OAuthConfig<KeycloakProfile>) => {
  try {
    if (Date.now() > token.refreshTokenExpired) throw Error;
    const details = {
      client_id: provider.options?.clientId,
      client_secret: provider.options?.clientSecret,
      grant_type: ['refresh_token'],
      refresh_token: token.refreshToken,
    };
    const formBody: string[] = [];
    Object.entries(details).forEach(([key, value]: [string, any]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      formBody.push(encodedKey + '=' + encodedValue);
    });
    const formData = formBody.join('&');
    const url = `${provider.options?.issuer}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formData,
    });
    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpired: Date.now() + (refreshedTokens.expires_in - 15) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      refreshTokenExpired:
        Date.now() + (refreshedTokens.refresh_expires_in - 15) * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        KeycloakProvider({
            id: "mockrealm",
            name: "Mockrealm",
            // @ts-ignore
            clientId: process.env.KEYCLOAK_ID,
            // @ts-ignore
            clientSecret: process.env.KEYCLOAK_SECRET,
            issuer: process.env.KEYCLOAK_ISSUER,
        }),
        KeycloakProvider({
            id: "realm2",
            name: "Realm2",
            // @ts-ignore
            clientId: "mock_login_client2",
            // @ts-ignore
            clientSecret: "mock_login_secret",
            issuer: "http://oidc:8080/realms/" + "realm2",
        })
    ],
    callbacks: {
        async jwt({token, user, account, profile}: {
          token: any,
          user: User,
          account: any,
          profile?: Profile,
          trigger?: "signIn" | "signUp" | "update"
        }) {
          // Initial sign in
          if (account) {

            token.accessToken = account.access_token
            token.accessTokenExpires = Date.now() + (account.expires_in - 15) * 1000;

            token.refreshToken = account.refresh_token
            token.refreshTokenExpired = Date.now() + (account.refresh_expires_in - 15) * 1000;

            token.provider = account.provider
            token.user = user
          }

          // Return previous token if the access token has not expired yet
          if (Date.now() < token.accessTokenExpires) {
            return token
          }

          // Access token has expired, try to update it
          var provider = authOptions.providers.filter((i) => i.options?.id == token.provider)[0]
          return refreshAccessToken(token, provider)
        },
        async session({session, token, user}: {
          session: any,
          token: any,
          user: any
        }) {
          session.user = token.user
          session.accessToken = token.accessToken
          session.error = token.error
          return session
        }
    }
}

const handler = NextAuth(authOptions)


export {handler as GET, handler as POST}
