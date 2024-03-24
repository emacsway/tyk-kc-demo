import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak";


export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        KeycloakProvider({
            id: "mockrealm",
            name: "mockrealm",
            // @ts-ignore
            clientId: process.env.KEYCLOAK_ID,
            // @ts-ignore
            clientSecret: process.env.KEYCLOAK_SECRET,
            issuer: process.env.KEYCLOAK_ISSUER,
        }),
        KeycloakProvider({
            id: "realm2",
            name: "realm2",
            // @ts-ignore
            clientId: "mock_login_client2",
            // @ts-ignore
            clientSecret: "mock_login_secret",
            issuer: "http://oidc:8080/realms/" + "realm2",
        })
    ],
    callbacks: {
        async jwt({token, account}: { token: any, account: any }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({session, token, user}: { session: any, token: any, user: any }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken
            return session
        }
    }
}

const handler = NextAuth(authOptions)


export {handler as GET, handler as POST}
