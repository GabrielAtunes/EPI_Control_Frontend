import React, { useState, useEffect } from "react";
import { authService } from "../../services/auth/authService";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("login_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await authService.login(email, senha);

      // Salva apenas o e-mail para facilitar o próximo login
      localStorage.setItem("login_email", email);

      onLoginSuccess();
    } catch (err: any) {
      setErro(
        err.message || "E-mail ou senha inválidos. Verifique suas credenciais.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔵 BACKGROUND: Utilizando o seu tema real bg-brand-dark
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-dark px-4 font-sans">
      {/* BACKGROUND: Gradientes e Grid Patern para dar um ar tecnológico */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:32px_32px" />
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-500px h-500px bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* CARD PRINCIPAL */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-brand-dark/80 border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] p-8 sm:p-10">
        {/* LOGO - Margem inferior reduzida de mb-10 para mb-6 para aproximar do form */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-blue-500/10 p-3 rounded-2xl mb-3 border border-blue-500/20 shadow-inner">
            <ShieldCheck
              className="w-10 h-10 text-blue-400"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-blue-400 drop-shadow-sm">
            EPI
            <span className="text-white">CONTROL</span>
          </h2>
          <p className="text-sm mt-2 text-gray-400 font-medium">
            Gestão e Segurança Inteligente
          </p>
        </div>

        {/* ALERTA DE ERRO */}
        {erro && (
          <div className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 animate-fade-in shadow-lg">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold">Falha na autenticação</p>
              <p className="opacity-90">{erro}</p>
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* CAMPO: E-MAIL */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300 ml-1">
              E-mail
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                text-white placeholder-gray-500 shadow-sm
                focus:bg-white/10 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* CAMPO: SENHA */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-sm font-medium text-gray-300">
                Senha
              </label>
              <a
                href="#"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 
                text-white placeholder-gray-500 shadow-sm
                focus:bg-white/10 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                placeholder="••••••••"
              />
              {/* BOTÃO MOSTRAR/ESCONDER SENHA */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-3.5 px-4 mt-2 rounded-xl font-bold text-white tracking-wide transition-all duration-300 shadow-lg
            ${
              loading
                ? "bg-blue-500/70 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Autenticando...
              </>
            ) : (
              "Acessar Sistema"
            )}
          </button>
        </form>
      </div>

      {/* ESTILOS DE ANIMAÇÃO */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        `}
      </style>
    </div>
  );
}
