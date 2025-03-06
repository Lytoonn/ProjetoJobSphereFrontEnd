import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import "react-toastify/dist/ReactToastify.css";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useRouter } from "next/router";
import useMessages from "../hooks/useMessages";

// Define the API URL
const API_URL = process.env.NEXT_PUBLIC_APIS_URL_REMOTE;

export default function Register() {
  const messages = useMessages();
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const router = useRouter();
  const emailInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    } else {
      setDarkMode(false); // Default to light mode if no theme is set
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simulate initial loading
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error(messages.register?.fields_required);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error(messages.register?.invalid_email);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(messages.register?.password_mismatch);
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/api/register`,
        { username: formData.email, password: formData.password },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(messages.register?.register_success);
      setTimeout(() => router.push("/auth"), 1000);
    } catch (error) {
      let errorMessage = messages.register?.register_error;
      if (error.response) {
        errorMessage = error.response.data?.error || messages.register?.register_error;
      } else if (error.request) {
        errorMessage = messages.auth?.network_error;
      } else {
        errorMessage = error.message;
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
      <Head>
        <title>JobSphere - Register</title>
        <meta name="description" content="Register for access to services." />
        <link rel="icon" href="/darkLogo.svg" />
      </Head>

      <div className="flex items-center justify-center min-h-screen grad-bg login-txt-header relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mb-4"></div>
            <p className="text-lg font-semibold text-white">Loading...</p>
          </div>
        )}

        {!isLoading && (
          <div className="login-form-bg p-8 rounded-lg shadow-lg w-full max-w-md border border-form flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              {darkMode ? <Image src="/lightLogo.png" alt="JobSphere Logo" width={40} height={40} /> : <Image src="/darkLogo.svg" alt="JobSphere Logo" width={40} height={40} />}
              <h2 className="text-2xl font-semibold">{messages.register?.title}</h2>
            </div>

            <form onSubmit={handleRegister} className="w-full">
              <Input label={messages.register?.email_label} type="email" name="email" value={formData.email} onChange={handleChange} ref={emailInputRef} />
              <Input label={messages.register?.password_label} type="password" name="password" value={formData.password} onChange={handleChange} />
              <Input label={messages.register?.confirm_password_label} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              <Button text={messages.register?.register_button} className="w-full transition-transform transform hover:scale-105 bg-btn-theme"/>
            </form>

            <p className="text-center text-sm mt-4">
              {messages.register?.account_exists}{" "}
              <a onClick={() => router.push("/auth")} className="login-txt-form hover:underline cursor-pointer">
                {messages.register?.login_here}
              </a>
            </p>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />

        <button onClick={toggleDarkMode} className="absolute top-4 left-4 p-2 bg-btn-theme text-white rounded-full">
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </>
  );
}
