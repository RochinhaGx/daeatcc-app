import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Waves, Shield, Zap } from "lucide-react";
import esp32Image from "@/assets/esp32-hero.jpg";

const LoginScreen = () => {
  return (
    <div className="mobile-container animate-fade-in">
      {/* Header com logo */}
      <div className="text-center pt-12 pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Waves className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">DAEA</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Sistema Inteligente de Monitoramento</p>
      </div>

      {/* Frase de impacto */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6 leading-tight">
          Tecnologia contra enchentes,{" "}
          <span className="text-primary">acessível e eficaz</span>
        </h2>

        {/* Imagem da ESP32 */}
        <div className="relative mb-8">
          <Card className="card-daea p-0 overflow-hidden">
            <img
              src={esp32Image}
              alt="Placa ESP32 - Sistema DAEA"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </Card>
        </div>

        {/* Features cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="card-daea p-4 text-center">
            <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium text-muted-foreground">Seguro</p>
          </Card>
          <Card className="card-daea p-4 text-center">
            <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium text-muted-foreground">Rápido</p>
          </Card>
          <Card className="card-daea p-4 text-center">
            <Waves className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium text-muted-foreground">Eficaz</p>
          </Card>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="px-6 space-y-4">
        <Button className="btn-daea w-full py-4">
          <span className="font-semibold">Entrar no Sistema</span>
        </Button>
        <Button variant="outline" className="btn-daea-secondary w-full py-4">
          <span className="font-semibold">Criar Nova Conta</span>
        </Button>
      </div>

      {/* Footer info */}
      <div className="px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Monitore água acumulada em ambientes urbanos
        </p>
        <p className="text-xs text-muted-foreground">
          Combata alagamentos sem obras caras
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;