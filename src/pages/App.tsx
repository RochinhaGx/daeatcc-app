import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import HistoryScreen from "@/components/HistoryScreen";
import ConfigScreen from "@/components/ConfigScreen";
import TabNavigation from "@/components/TabNavigation";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Simula o login (pode ser substituído por lógica real)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Se não estiver logado, mostra a tela de login
  if (!isLoggedIn) {
    return (
      <div onClick={handleLogin}>
        <LoginScreen />
      </div>
    );
  }

  // Renderiza o conteúdo baseado na tab ativa
  const renderContent = () => {
    switch (activeTab) {
      case "home":
      case "sensors":
        return <Dashboard />;
      case "history":
        return <HistoryScreen />;
      case "settings":
        return <ConfigScreen />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Conteúdo principal */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Navegação inferior fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </nav>
    </div>
  );
};

export default App;