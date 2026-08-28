import { useContext } from "react"
import { AuthContext } from "./AuthContext"

export const useAuthCtx = () => {
  return useContext(AuthContext);
}
