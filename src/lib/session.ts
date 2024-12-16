import { IronSessionData } from "iron-session";

export type User = {
  id: string;
  email: string;
  isLoggedIn: boolean;
};

export const defaultSession: IronSessionData = {
  user: {
    id: "",
    email: "",
    isLoggedIn: false,
  },
};
