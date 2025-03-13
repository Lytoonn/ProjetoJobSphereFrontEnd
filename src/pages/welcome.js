import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMessages from "../hooks/useMessages";
import axiosInstance from "../lib/axiosInstance";
import Link from "next/link";

export default function JobSearchPage() {
  const messages = useMessages();
  const [sessionData, setSessionData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for saved theme preference
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
      document.body.classList.remove('dark');
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
      
      // Directly manipulate the body class here
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

  // We don't need the darkMode class on this div since we're applying it to body directly
  return (
    <div className="min-h-screen font-sans">
      {/* Navbar */}
      <nav className="grad-bg p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold header-txt">
          Welcome, {sessionData?.user.email || "User"}
        </h1>
        <div className="flex space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 bg-btn-theme rounded-full">
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
      <div className="p-6 max-w-4xl mx-auto job-theme-bg">
        <h2 className="text-2xl font-semibold mb-4 page-text">Job Opportunities</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 rounded-md shadow-md job-theme">
              <Link href={`/job/${job.id}`}>
                <a className="cursor-pointer">
                  <h3 className="text-xl font-bold job-title hover:underline">{job.title}</h3>
                </a>
              </Link>
              <p className="job-company">{job.company} - {job.location}</p>
              <button className="mt-2 font-bold py-1 px-4 rounded job-button">
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}