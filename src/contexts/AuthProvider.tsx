import React, {useRef, useState } from "react";
import { AuthContext } from "./AuthContext";



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Change this from "allowEdit" item, to some sort of jwt token
  const [allowEdit, setAllowEdit] = useState<boolean>(
    () => localStorage.getItem("allowEdit") === "true"
  );
  const triedAmount = useRef<number>(0);
  const editPw = import.meta.env.VITE_PW as string;

  const askPermission = async (pw: string): Promise<boolean> => {
    if (allowEdit) return true;
    if (triedAmount.current >= 3) return false;
    if (pw === editPw) {
      setAllowEdit(true);
      localStorage.setItem("allowEdit", "true");
      triedAmount.current = 0;
      return true;
    }
    triedAmount.current += 1;
    return false;
  };

  return (
    <AuthContext.Provider value={{ allowEdit, askPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
