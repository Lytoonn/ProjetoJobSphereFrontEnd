import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMessages from "../hooks/useMessages";
import axiosInstance from "../lib/axiosInstance";

export default function WelcomePage() {
  const messages = useMessages();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axiosInstance.get("/api/session", { timeout: 5000 });
        if (!data.valid) {
          throw new Error("Sessão inválida");
        }
        setSessionData(data);
      } catch (error) {
        console.error("Erro na API:", error.message || error);
        let errorMessage = messages.error?.server_error;
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = messages.error?.session_not_found;
          } else if (error.response.status === 500) {
            errorMessage = messages.error?.server_error;
          }
        } else if (error.code === "ECONNABORTED") {
          errorMessage = messages.error?.server_timeout;
        } else if (error.message.includes("Network Error")) {
          errorMessage = messages.error?.server_unavailable;
        }
        toast.error(errorMessage);
        setTimeout(() => router.push("/auth"), 2000);
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await axiosInstance.post("/api/logout");
    toast.info(messages.auth?.logout_success);
    router.push("/auth");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mb-4"></div>
          <p className="text-lg font-semibold text-white">A carregar...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {loading ? (
            <p className="text-gray-400">{messages.button?.loading}</p>
          ) : sessionData ? (
            <div className="bg-gray-800 text-gray-300 p-6 rounded-md w-full max-w-md border border-gray-700 shadow-lg text-center">
              <h1 className="text-2xl font-bold text-blue-400">{messages.welcome?.greeting}, {sessionData.user.username}!</h1>
              <p className="mt-2 text-gray-400">{messages.welcome?.message}</p>
              <button
                onClick={handleLogout}
                className="mt-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full transition-transform transform hover:scale-105"
              >
                {messages.auth?.logout_button || "Sair"}
              </button>
            </div>
          ) : (
            <p className="text-gray-400">{messages.welcome?.session_expired}</p>
          )}
        </>
      )}
    </div>
  );
}
