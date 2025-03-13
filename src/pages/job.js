import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMessages from "../hooks/useMessages";
import axiosInstance from "../lib/axiosInstance";
import Link from "next/link";

export default function Job() {
  const messages = useMessages();
  const [sessionData, setSessionData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

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

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  const fetchJobDetails = async (jobId) => {
    setLoading(true);
    try {
      // In a real app, you would fetch from an API
      // For now, we'll use mock data
      const jobsData = [
        { 
          id: 1, 
          title: "Desenvolvedor Frontend", 
          company: "Tech Corp", 
          location: "Remoto",
          salary: "€45,000 - €60,000",
          type: "Full-time",
          description: "Estamos à procura de um desenvolvedor frontend talentoso para se juntar à nossa equipe. O candidato ideal terá experiência com React, Next.js e Tailwind CSS.",
          requirements: [
            "Mínimo de 2 anos de experiência com React",
            "Conhecimento de Next.js e Tailwind CSS",
            "Experiência com APIs RESTful",
            "Boa comunicação e trabalho em equipe"
          ],
          benefits: [
            "Trabalho remoto",
            "Horário flexível",
            "Seguro de saúde",
            "Oportunidades de crescimento"
          ]
        },
        { 
          id: 2, 
          title: "Engenheiro de Software", 
          company: "InovaTech", 
          location: "Lisboa, Portugal",
          salary: "€50,000 - €70,000",
          type: "Full-time",
          description: "A InovaTech está procurando um engenheiro de software experiente para desenvolver soluções de alta qualidade. Você trabalhará em projetos desafiadores com tecnologias de ponta.",
          requirements: [
            "Formação em Ciência da Computação ou área relacionada",
            "Experiência com desenvolvimento backend (Node.js, Python)",
            "Conhecimento de bancos de dados SQL e NoSQL",
            "Familiaridade com metodologias ágeis"
          ],
          benefits: [
            "Escritório moderno no centro de Lisboa",
            "Ambiente de trabalho colaborativo",
            "Plano de carreira estruturado",
            "Eventos e workshops de tecnologia"
          ]
        },
        { 
          id: 3, 
          title: "Analista de Dados", 
          company: "Data Insights", 
          location: "Porto, Portugal",
          salary: "€40,000 - €55,000",
          type: "Full-time",
          description: "Junte-se à equipe de análise de dados da Data Insights e transforme dados complexos em insights valiosos para nossos clientes.",
          requirements: [
            "Experiência com análise de dados e visualização",
            "Conhecimento de Python, R ou ferramentas similares",
            "Habilidade com SQL e bancos de dados",
            "Capacidade de comunicar resultados técnicos para não-técnicos"
          ],
          benefits: [
            "Escritório com vista para o rio Douro",
            "Desenvolvimento profissional contínuo",
            "Ambiente de trabalho dinâmico",
            "Equipe internacional"
          ]
        }
      ];

      const job = jobsData.find(job => job.id === parseInt(jobId));
      if (job) {
        setJobDetails(job);
      } else {
        toast.error("Vaga não encontrada");
        router.push("/welcome");
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da vaga:", error);
      toast.error("Erro ao carregar detalhes da vaga");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center">
        <div className="page-text text-xl">Carregando...</div>
      </div>
    );
  }

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

      {/* Job Details */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/welcome">
            <a className="flex items-center page-text hover:underline">
              <span>← Voltar para vagas</span>
            </a>
          </Link>
        </div>
        
        <div className="p-6 rounded-md shadow-md job-theme">
          <h2 className="text-3xl font-bold job-title mb-2">{jobDetails.title}</h2>
          <p className="job-company text-xl mb-6">{jobDetails.company} - {jobDetails.location}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-white bg-opacity-30 rounded-md dark:bg-black dark:bg-opacity-20">
              <p className="job-title font-semibold">Tipo de Contrato</p>
              <p className="job-company">{jobDetails.type}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-30 rounded-md dark:bg-black dark:bg-opacity-20">
              <p className="job-title font-semibold">Faixa Salarial</p>
              <p className="job-company">{jobDetails.salary}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold job-title mb-2">Descrição</h3>
            <p className="job-company">{jobDetails.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold job-title mb-2">Requisitos</h3>
            <ul className="list-disc list-inside job-company">
              {jobDetails.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold job-title mb-2">Benefícios</h3>
            <ul className="list-disc list-inside job-company">
              {jobDetails.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6">
            <button className="font-bold py-2 px-6 rounded-md job-button">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}