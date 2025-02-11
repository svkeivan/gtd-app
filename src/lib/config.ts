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

export const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/callback',
  '/_next',
  '/favicon.ico',
  '/public'
];
