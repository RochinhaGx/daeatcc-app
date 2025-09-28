import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Bell, 
  Wifi, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings as SettingsIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ConfigScreen = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar sair do sistema",
        variant: "destructive"
      });
    }
  };
  const settingsOptions = [
    {
      id: "profile",
      name: "Perfil do Usuário",
      description: "Gerenciar conta e preferências",
      icon: User,
      color: "text-blue-500"
    },
    {
      id: "notifications",
      name: "Notificações",
      description: "Alertas e avisos do sistema",
      icon: Bell,
      color: "text-green-500"
    },
    {
      id: "network",
      name: "Conexão",
      description: "WiFi e configurações de rede",
      icon: Wifi,
      color: "text-purple-500"
    },
    {
      id: "security",
      name: "Segurança",
      description: "Senha e autenticação",
      icon: Shield,
      color: "text-red-500"
    }
  ];

  return (
    <div className="w-full p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu sistema DAEA</p>
      </div>

      {/* Perfil do usuário */}
      <Card className="card-daea mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{user?.email}</h3>
            <p className="text-sm text-muted-foreground">Sistema ativo</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>

      {/* Opções de configuração */}
      <div className="space-y-4 mb-6">
        {settingsOptions.map((option) => (
          <Card key={option.id} className="card-daea cursor-pointer hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-secondary/50 ${option.color}`}>
                  <option.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      {/* Status do sistema */}
      <Card className="card-daea mb-6">
        <h3 className="text-lg font-semibold mb-4">Sistema</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versão do App</span>
            <span className="font-medium">1.2.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Firmware ESP32</span>
            <span className="font-medium">2.1.3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última Sync</span>
            <span className="font-medium">Agora</span>
          </div>
        </div>
      </Card>

      {/* Ações rápidas */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          <HelpCircle className="h-4 w-4 mr-3" />
          Ajuda e Suporte
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair do Sistema
        </Button>
      </div>

      {/* Footer */}
      <div className="pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          DAEA © 2024 • Tecnologia contra enchentes
        </p>
      </div>
    </div>
  );
};

export default ConfigScreen;