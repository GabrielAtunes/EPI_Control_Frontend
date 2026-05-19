import { api } from "../api/api";
import { AxiosError } from "axios";

export const authService = {
  login: async (email: string, senha: string) => {
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", senha);
      params.append("grant_type", "password"); // Garante a compatibilidade com o OAuth2 rigoroso

      // O .toString() garante que o Axios envie como string (email=...&password=...)
      // O header explícito impede que o Axios tente transformar em JSON de última hora
      const response = await api.post("/login", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user_nome", response.data.user_nome);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // Log específico para te ajudar caso o 422 persista
        if (error.response.status === 422) {
          console.error(
            "Erro 422 (Validação do FastAPI):",
            error.response.data,
          );
          throw new Error(
            "Erro no formato dos dados enviados. Verifique o console.",
          );
        }

        throw new Error(error.response.data.detail || "Falha na autenticação.");
      }
      throw new Error("Não foi possível conectar ao servidor.");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_nome");
    window.location.href = "/";
  },
};
