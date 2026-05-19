import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // O plugin react() é OBRIGATÓRIO para o Hot Reload funcionar
});
