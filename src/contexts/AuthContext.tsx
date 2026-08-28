import { createContext } from "react";

export interface AuthContextType {
  allowEdit: boolean;
  askPermission: (pw: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
