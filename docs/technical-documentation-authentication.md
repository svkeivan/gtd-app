### Authentication Setup
The application uses Iron Session for secure, encrypted session management.

**Key Files:**

-   `src/lib/auth.ts`: Contains the `auth` function for retrieving the session and user data.
-   `src/actions/auth.ts`: Contains the `login`, `register`, `logout`, `getSession`, and `validateSession` functions for handling authentication logic.
-   `src/lib/config.ts`: Defines the `ironOptions` configuration for Iron Session.

**Libraries Used:**

-   `iron-session`: For secure session management.
-   `bcryptjs`: For password hashing.
-   `@prisma/client`: For interacting with the database.

**Configuration:**

The Iron Session configuration is defined in `src/lib/config.ts`:

```typescript
// src/lib/config.ts
export const ironOptions = {
  cookieName: "gtd_session",
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
```

The `SECRET_COOKIE_PASSWORD` environment variable is used to encrypt the session cookie.

**Authentication Flow:**

1.  The user submits their email and password to the `/api/auth/login` endpoint.
2.  The `login` function in `src/actions/auth.ts` validates the email and password.
3.  If the email and password are valid, the `login` function retrieves the user from the database.
4.  The `login` function then creates an Iron Session and sets the user data in the session.
5.  The session is saved, and a cookie is set in the user's browser.
6.  On subsequent requests, the `auth` function in `src/lib/auth.ts` retrieves the session from the cookie.
7.  The user data is then available to the application.

**Security Considerations:**

-   The `SECRET_COOKIE_PASSWORD` environment variable should be a strong, randomly generated string.
-   HTTPS should be used in production to protect the session cookie from being intercepted.
-   The `httpOnly` cookie option should be set to `true` to prevent client-side JavaScript from accessing the session cookie.
-   The `secure` cookie option should be set to `true` in production to ensure that the session cookie is only sent over HTTPS.