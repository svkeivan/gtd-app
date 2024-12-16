import { ironOptions } from "./config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { User } from "./session";

export async function auth() {
  const session = await getIronSession(await cookies(), ironOptions);
  const user: User | undefined = session.user;

  return {
    session,
    user,
  };
}
