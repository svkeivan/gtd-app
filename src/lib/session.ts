import { IronSessionData } from 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: string
      email: string
      isLoggedIn: boolean
    }
  }
}

export type User = {
  id: string
  email: string
  isLoggedIn: boolean
}

