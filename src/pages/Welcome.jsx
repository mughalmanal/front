import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  // 🔐 Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-900 via-blue-950 to-blue-800 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Blurred animated background gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-white/5 blur-2xl opacity-10 animate-pulse" />

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-center z-10 animate-fade-in-down leading-snug tracking-wide">
        WELCOME TO <br />
        <span className="text-blue-300">ASIF AND BROTHERS</span>
      </h1>

      {/* Login Button */}
      <button
        onClick={() => navigate("/login")}
        className="mt-10 px-8 py-3 bg-white text-blue-900 font-semibold text-lg rounded-xl shadow-lg hover:bg-blue-100 transition duration-300 z-10 animate-fade-in-up"
      >
        Login
      </button>
    </div>
  );
}

export default Welcome;
