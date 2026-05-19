import axios from "axios";

// Cria uma instância do Axios apontando para o nosso backend Python
export const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});
