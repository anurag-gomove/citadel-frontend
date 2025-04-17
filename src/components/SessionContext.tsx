
import { createContext } from "react";
import { Session } from "@supabase/supabase-js";

export interface SessionContextValue {
  session: Session | null;
  data?: {
    user: {
      id: string;
      email: string;
      user_metadata: {
        first_name?: string;
        last_name?: string;
      };
    };
  };
}

export const SessionContext = createContext<SessionContextValue>({
  session: null,
});
