import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMessages from "../hooks/useMessages";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Image from "next/image";
import { FiAlertTriangle } from "react-icons/fi";
import axiosInstance from "../lib/axiosInstance";

export default function Auth() {
  const messages = useMessages();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();
  const emailInputRef = useRef(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    } else {
      // Default to light mode if no preference is saved
      setDarkMode(false);
    }

    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    async function checkDBStatus() {
      try {
        const { data, status } = await axiosInstance.get("/api/db-status", {
          timeout: 5000,
          validateStatus: () => true,
        });

        if (status === 200 && data.status === "online") {
          setDbStatus("online");
          setServerError(false);
        } else {
          setDbStatus("offline");
          setServerError(false);
        }
      } catch {
        setServerError(true);
        setDbStatus(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkDBStatus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (serverError) {
      toast.error(messages.server?.server_offline);
      return;
    }

    if (dbStatus === "offline") {
      toast.error(messages.database?.db_offline_message);
      return;
    }

    try {
      const { data } = await axiosInstance.post("/api/loginDB", {
        username: formData.email,
        password: formData.password,
      });

      toast.success(messages.auth?.login_success);
      setTimeout(() => router.push("/welcome"), 1000);
    } catch (error) {
      let errorMessage = messages.auth?.login_error;
      if (error.response) {
        if (error.response.status === 404) errorMessage = messages.auth?.user_not_found;
        else if (error.response.status === 500) errorMessage = messages.server?.server_offline;
      } else if (error.message.includes("Network Error")) {
        errorMessage = messages.server?.server_offline;
      }
      toast.error(errorMessage);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      if (newMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      return newMode;
    });
  };

  return (
    <>
      {/* ✅ SEO Tags */}
      <Head>
        <title>JobSphere - Login</title>
        <meta name="description" content="Login para acesso a serviços." />
        <link rel="icon" href="/darkLogo.svg" />
      </Head>

      {/* ✅ Estrutura da Página */}
      <div className="flex items-center justify-center min-h-screen grad-bg login-txt-header relative">
        
        {/* ✅ Animação de Carregamento antes de renderizar o conteúdo */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mb-4"></div>
            <p className="text-lg font-semibold text-white">Loading...</p>
          </div>
        )}

        {/* ✅ Formulário de Login */}
        {!isLoading && (
          <div className="login-form-bg p-8 rounded-lg shadow-lg w-full max-w-md border border-form flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              {darkMode ? <Image src="/lightLogo.png" alt="JobSphere Logo" width={40} height={40} /> : <Image src="/darkLogo.svg" alt="JobSphere Logo" width={40} height={40} />}
              <h2 className="text-2xl font-semibold">{messages.auth?.login_title}</h2>
            </div>

            <form onSubmit={handleLogin} className="w-full">
              <Input 
                label={messages.auth?.email_label} 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                ref={emailInputRef} 
                disabled={serverError || dbStatus === "offline"}
              />
              <Input 
                label={messages.auth?.password_label} 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                disabled={serverError || dbStatus === "offline"}
              />

              <Button text={messages.auth?.login_button} disabled={serverError || dbStatus === "offline"} />

              {/* ✅ Link "Recuperar password" desativado se o servidor estiver offline */}
              <div className={`text-center mt-4 text-sm ${serverError || dbStatus === "offline" ? "opacity-50 pointer-events-none" : ""}`}>
                <a onClick={() => router.push("/recover")} className="text-black hover:underline cursor-pointer">
                {messages.recover?.title}
                </a>
              </div>
            </form>
            
            {/* ✅ Link "Registe-se" desativado se o servidor estiver offline */}
            <p className={`text-center text-sm mt-4 ${serverError || dbStatus === "offline" ? "opacity-50 pointer-events-none" : ""}`}>
              Don't have an account?{" "}
              <a onClick={() => router.push("/register")} className="text-black hover:underline cursor-pointer">
                Register
              </a>
            </p>
          </div>
        )}

        {/* ✅ Indicador do estado da base de dados movido para o canto **superior direito** */}
        {!isLoading && (
          <div className="absolute top-5 right-5 flex items-center space-x-2">
            {serverError === true ? (
              <>
                <FiAlertTriangle className="text-red-500 text-xl animate-bounce" />
                <p className="text-sm login-txt-form">{messages.server?.server_offline}</p>
              </>
            ) : dbStatus === "online" ? (
              <>
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm login-txt-form">{messages.database?.db_online}</p>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <p className="text-sm login-txt-form">{messages.database?.db_offline}</p>
              </>
            )}
            {/*<PwaInstallButton />*/}
          </div>
        )}

        {/* ✅ Notificações Toastify */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      {/* Dark Mode Toggle */}
      <button 
          onClick={toggleDarkMode} 
          className="absolute top-4 left-4 p-2 bg-btn-theme text-white rounded-full">
          {darkMode ? '🌙' : '☀️'}
      </button>
    </>
  );
}
