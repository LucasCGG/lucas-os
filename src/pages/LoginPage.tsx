import { useState } from "react";
import { useAuthCtx } from "../contexts";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { askPermission } = useAuthCtx();
  const navigate = useNavigate();
  const [uname, setUname] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onSubmit = async () => {
    try {
      const permission = await askPermission(password);
      if (!permission) {
        throw new Error("permission denied");
      }
      localStorage.setItem("hideStartup", "true");
      navigate("/");
    } catch (err) {
      console.error("[LOGINPAGE]", err);
    }
  };

  return (
      <div className="h-screen w-screen bg-[#5D341A] flex items-center justify-center">
        <div className="retro-window rounded-lg shadow-2xl p-8 max-w-md w-full overflow-hidden">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={uname}
                onChange={(e) => setUname(e.target.value)}
                className="w-full px-4 py-3 border-b-2 border-gray-500 bg-[#181818] text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-b-2 border-gray-500 bg-[#181818] text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  };

export default LoginPage;
