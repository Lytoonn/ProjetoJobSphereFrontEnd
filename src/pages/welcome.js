import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMessages from "../hooks/useMessages";
import axiosInstance from "../lib/axiosInstance";

export default function JobSearchPage() {
  const messages = useMessages();
  const [sessionData, setSessionData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

    const checkSession = async () => {
      try {
        const { data } = await axiosInstance.get("/api/session", { timeout: 5000 });
        if (!data.valid) {
          throw new Error("Sessão inválida");
        }
        setSessionData(data);
      } catch (error) {
        console.error("Erro na API:", error.message || error);
        toast.error("Erro ao carregar sessão");
        setTimeout(() => router.push("/auth"), 2000);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await axiosInstance.post("/api/logout");
    toast.info("Sessão encerrada");
    router.push("/auth");
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

  const jobs = [
    { id: 1, title: "Desenvolvedor Frontend", company: "Tech Corp", location: "Remoto" },
    { id: 2, title: "Engenheiro de Software", company: "InovaTech", location: "Lisboa, Portugal" },
    { id: 3, title: "Analista de Dados", company: "Data Insights", location: "Porto, Portugal" },
  ];

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-black text-white font-sans`}>
      {/* Navbar */}
      <nav className="grad-bg p-4 flex justify-between items-center">
      <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-black"}`}>
        Bem-vindo, {sessionData?.user.email}
      </h1>
        <div className="flex space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 bg-btn-theme text-white rounded-full">
            {darkMode ? '🌙' : '☀️'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Job Listings */}
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Oportunidades de Emprego</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-gray-800 p-4 rounded-md shadow-md">
              <h3 className="text-xl font-bold text-blue-400">{job.title}</h3>
              <p className="text-gray-300">{job.company} - {job.location}</p>
              <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                Candidatar-se
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
