import type { IUserDoc } from "../../models/userSchema";

declare global {
  namespace Express {
    interface Request {
      userInfo?: IUserDoc;
      token?: string;
      unAuthenticateUser?: boolean;
      file?: {
        path?: string;
      };
    }
  }
}

export {};
