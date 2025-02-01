import { ironOptions } from "./config";
import { IronSessionData, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { defaultSession } from "./session";

export async function auth() {
  const session = await getIronSession<IronSessionData>(await cookies(), ironOptions);
  const user = session.user ?? defaultSession.user;

  return {
    session,
    user,
  };
}
