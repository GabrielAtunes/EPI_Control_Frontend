import { useState, useEffect } from "react";
import { AppRoutes } from "./Routes/AppRoutes";
import { LoginPage } from "./pages/login/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 🟢 Limpo: Sem <BrowserRouter> aqui, ele já vem do main.tsx
  return <AppRoutes />;
}

export default App;
