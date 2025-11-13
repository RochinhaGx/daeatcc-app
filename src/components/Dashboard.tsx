import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Power, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Zap,
  Activity,
  AlertCircle,
  TrendingUp,
  Waves,
  CheckCircle2,
  Bluetooth,
  Radio
} from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { useSensorData } from "@/hooks/useSensorData";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { useBluetoothConnection } from "@/hooks/useBluetoothConnection";
import { toast } from "sonner";

const Dashboard = () => {
  const { devices, loading: devicesLoading, createDevice, toggleDeviceStatus } = useDevices();
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const { latestData, loading: sensorLoading, simulateSensorData } = useSensorData(currentDevice?.id);
  const { config, createConfig } = useSystemConfig(currentDevice?.id);
  const bluetooth = useBluetoothConnection();

  // Initialize device on first load
  useEffect(() => {
    if (!devicesLoading && devices.length === 0) {
      createDevice('DAEA Dispositivo Principal', 'Sistema Principal');
    } else if (devices.length > 0) {
      setCurrentDevice(devices[0]);
      // Gerar dados iniciais simulados
      if (simulateSensorData) {
        simulateSensorData(devices[0].id);
      }
    }
  }, [devices, devicesLoading]);

  // Create config if device exists but no config
  useEffect(() => {
    if (currentDevice && !config) {
      createConfig(currentDevice.id);
    }
  }, [currentDevice, config]);

  const isOnline = currentDevice?.status === 'ligado';

  const handleToggleDevice = async () => {
    if (!currentDevice) return;
    
    try {
      // Se Bluetooth conectado, controla via BT
      if (bluetooth.isConnected) {
        if (isOnline) {
          await bluetooth.turnOff();
        } else {
          await bluetooth.turnOn();
        }
      }
      
      // Atualiza no banco também
      await toggleDeviceStatus(currentDevice.id);
      toast.success(
        isOnline ? '✅ Sistema desligado com sucesso' : '🟢 Sistema ligado com sucesso'
      );
    } catch (error) {
      toast.error('❌ Erro ao alterar status do sistema');
      console.error(error);
    }
  };


  if (devicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando dispositivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Controle do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentDevice?.name || 'Carregando...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={isOnline ? "default" : "secondary"}
              className="text-sm px-4 py-2 shadow-md"
            >
              {isOnline ? (
                <>
                  <span className="status-dot-online mr-2" />
                  Online
                </>
              ) : (
                <>
                  <span className="status-dot-offline mr-2" />
                  Offline
                </>
              )}
            </Badge>
            <Button
              variant={bluetooth.isConnected ? "default" : "outline"}
              size="sm"
              onClick={bluetooth.isConnected ? bluetooth.disconnect : bluetooth.connect}
              disabled={bluetooth.isConnecting}
            >
              {bluetooth.isConnecting ? (
                <>
                  <Radio className="h-4 w-4 mr-2 animate-pulse" />
                  Conectando...
                </>
              ) : bluetooth.isConnected ? (
                <>
                  <Bluetooth className="h-4 w-4 mr-2" />
                  BT Conectado
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4 mr-2" />
                  Conectar BT
                </>
              )}
            </Button>
          </div>
        </div>
      </div>


      {/* Bluetooth Data Card - Show when connected */}
      {bluetooth.isConnected && bluetooth.latestData && (
        <Card className="card-daea-gradient border-2 border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bluetooth className="h-4 w-4 text-primary animate-pulse" />
              Dados do Arduino (Bluetooth)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Umidade Solo</p>
                <p className="text-2xl font-bold text-primary">
                  {bluetooth.latestData.soilHumidity}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valor Bruto</p>
                <p className="text-2xl font-bold">
                  {bluetooth.latestData.rawValue}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Relés</p>
                <Badge variant={bluetooth.latestData.relayStatus === 'ON' ? 'default' : 'secondary'}>
                  {bluetooth.latestData.relayStatus === 'ON' ? '🟢 Ligados' : '⚫ Desligados'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Modo</p>
                <Badge variant={bluetooth.latestData.mode === 'AUTO' ? 'outline' : 'default'}>
                  {bluetooth.latestData.mode === 'AUTO' ? '🔄 Auto' : '📱 Manual'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Power Control - Featured Card */}
      <div 
        className={`power-toggle ${isOnline ? 'on' : 'off'}`}
        onClick={handleToggleDevice}
      >
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-2xl transition-all duration-300 ${
              isOnline 
                ? 'bg-success/20 shadow-[0_0_20px_hsl(var(--success)/0.3)]' 
                : 'bg-muted'
            }`}>
              <Power className={`h-12 w-12 transition-colors ${
                isOnline ? 'text-success' : 'text-muted-foreground'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Sistema {isOnline ? 'Ligado' : 'Desligado'}
              </h2>
              <p className="text-muted-foreground">
                {isOnline 
                  ? '🟢 Monitoramento ativo e funcionando' 
                  : '⚫ Sistema em standby'
                }
              </p>
            </div>
          </div>
          <Switch 
            checked={isOnline}
            onCheckedChange={handleToggleDevice}
            className="scale-150"
          />
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-daea-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold text-success">Ativo</p>
                    <p className="text-xs text-muted-foreground">Sistema operando normalmente</p>
                  </div>
                </>
              ) : (
                <>
                  <Power className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold text-muted-foreground">Inativo</p>
                    <p className="text-xs text-muted-foreground">Sistema desligado</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-daea-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Auto-Evaporação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                config?.auto_evaporation 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {config?.auto_evaporation ? 'Habilitado' : 'Desabilitado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {config?.auto_evaporation 
                    ? 'Cálculo automático ativo' 
                    : 'Modo manual'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Readings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold">Leituras dos Sensores</h2>
        </div>

        {sensorLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-24 bg-muted rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : latestData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature */}
            <Card className="sensor-card-modern group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 group-hover:scale-110 transition-transform">
                    <Thermometer className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Temperatura</p>
                  <p className="text-3xl font-bold">
                    {latestData.temperature ? `${latestData.temperature}°C` : '--'}
                  </p>
                  {config && latestData.temperature && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Faixa: {config.temperature_alert_min}°C - {config.temperature_alert_max}°C
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Humidity */}
            <Card className="sensor-card-modern group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 group-hover:scale-110 transition-transform">
                    <Droplets className="h-6 w-6 text-cyan-600" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Umidade do Ar</p>
                  <p className="text-3xl font-bold">
                    {latestData.humidity ? `${latestData.humidity}%` : '--'}
                  </p>
                  {config && latestData.humidity && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Faixa: {config.humidity_alert_min}% - {config.humidity_alert_max}%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Water Level */}
            <Card className="sensor-card-modern group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 group-hover:scale-110 transition-transform">
                    <Gauge className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nível de Água</p>
                  <p className="text-3xl font-bold">
                    {latestData.water_level ? `${latestData.water_level}cm` : '--'}
                  </p>
                  {config && latestData.water_level && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Limite: {config.water_level_alert}cm
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Evaporation Rate */}
            <Card className="sensor-card-modern group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Calculado
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Taxa de Evaporação</p>
                  <p className="text-3xl font-bold">
                    {latestData.evaporation_rate ? `${latestData.evaporation_rate}mm/h` : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {config?.auto_evaporation ? 'Automático' : 'Manual'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {isOnline 
                    ? 'Aguardando primeira leitura dos sensores...' 
                    : 'Ligue o sistema para começar a monitorar'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Info */}
      {latestData && (
        <Card className="card-daea-highlight">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema Monitorando</p>
                <p className="text-xs text-muted-foreground">
                  Última atualização: {new Date(latestData.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
