import type { AuthedUser } from "./middleware/session.js";

export type AppEnv = {
  Variables: {
    authUser: AuthedUser | null;
  };
};
