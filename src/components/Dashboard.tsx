import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  Thermometer, 
  Droplets, 
  Power, 
  PowerOff,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const Dashboard = () => {
  const systemStatus = "online"; // "online" | "offline"
  const sensors = [
    {
      id: "humidity",
      name: "Umidade",
      value: "65%",
      icon: Droplets,
      status: "normal",
      color: "text-blue-500"
    },
    {
      id: "water_level", 
      name: "Nível da Água",
      value: "2.3cm",
      icon: Waves,
      status: "warning",
      color: "text-orange-500"
    },
    {
      id: "temperature",
      name: "Temperatura", 
      value: "24°C",
      icon: Thermometer,
      status: "normal",
      color: "text-green-500"
    }
  ];

  return (
    <div className="mobile-container p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitoramento em tempo real</p>
      </div>

      {/* Status do Sistema */}
      <Card className="card-daea mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Status do Sistema</h3>
          <div className={`flex items-center space-x-2 ${
            systemStatus === "online" ? "status-online" : "status-offline"
          }`}>
            {systemStatus === "online" ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Controles principais */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="btn-daea py-6 flex flex-col items-center space-y-2">
            <Power className="h-6 w-6" />
            <span>Ligar Sistema</span>
          </Button>
          <Button variant="outline" className="btn-daea-secondary py-6 flex flex-col items-center space-y-2">
            <PowerOff className="h-6 w-6" />
            <span>Desligar</span>
          </Button>
        </div>
      </Card>

      {/* Sensores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Sensores</h3>
        <div className="space-y-4">
          {sensors.map((sensor) => (
            <Card key={sensor.id} className="card-daea">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-secondary/50 ${sensor.color}`}>
                    <sensor.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{sensor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {sensor.status === "warning" ? "Atenção" : "Normal"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{sensor.value}</p>
                  <div className={`h-2 w-12 rounded-full ${
                    sensor.status === "warning" ? "bg-orange-200" : "bg-green-200"
                  } ml-auto`}>
                    <div className={`h-full rounded-full ${
                      sensor.status === "warning" ? "bg-orange-500 w-3/4" : "bg-green-500 w-2/3"
                    }`} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Resumo rápido */}
      <Card className="card-daea">
        <h3 className="text-lg font-semibold mb-4">Resumo</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">48h</p>
            <p className="text-sm text-muted-foreground">Última chuva</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">0</p>
            <p className="text-sm text-muted-foreground">Alertas hoje</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;