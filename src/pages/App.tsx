import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoginScreen from "@/components/LoginScreen";
import HomeScreen from "@/components/HomeScreen";
import Dashboard from "@/components/Dashboard";
import HistoryScreen from "@/components/HistoryScreen";
import ConfigScreen from "@/components/ConfigScreen";
import TabNavigation from "@/components/TabNavigation";
import { useAuth } from "@/hooks/useAuth";

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login screen with auth button
  if (!user) {
    return (
      <div className="relative">
        <LoginScreen />
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <Button 
            onClick={() => navigate("/auth")}
            className="btn-daea px-8 py-3"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  // Renderiza o conteúdo baseado na tab ativa
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigate={setActiveTab} />;
      case "sensors":
        return <Dashboard />;
      case "history":
        return <HistoryScreen />;
      case "settings":
        return <ConfigScreen />;
      default:
        return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mobile-container">
        {/* Conteúdo principal */}
        <main className="flex-1 pb-20 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Navegação inferior fixa */}
        <nav className="fixed bottom-0 left-0 right-0 z-50">
          <TabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </nav>
      </div>
    </div>
  );
};

export default App;