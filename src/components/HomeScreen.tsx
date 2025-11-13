import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Droplets, 
  Thermometer, 
  Gauge, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { useSensorData } from '@/hooks/useSensorData';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import ArduinoConnectionDialog from './ArduinoConnectionDialog';
import heroImage from '@/assets/esp32-hero.jpg';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { devices } = useDevices();
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const { latestData, sensorData } = useSensorData(currentDevice?.id);
  const { config } = useSystemConfig(currentDevice?.id);

  useEffect(() => {
    if (devices.length > 0) {
      setCurrentDevice(devices[0]);
    }
  }, [devices]);

  const isOnline = currentDevice?.status === 'ligado';

  // Calculate statistics
  const totalReadings = sensorData.length;
  const avgTemperature = sensorData.length > 0 
    ? (sensorData.reduce((sum, d) => sum + (d.temperature || 0), 0) / sensorData.length).toFixed(1)
    : '--';
  const avgHumidity = sensorData.length > 0
    ? (sensorData.reduce((sum, d) => sum + (d.humidity || 0), 0) / sensorData.length).toFixed(1)
    : '--';

  // Check for alerts
  const hasAlerts = latestData && (
    (latestData.temperature && config && (
      latestData.temperature < config.temperature_alert_min ||
      latestData.temperature > config.temperature_alert_max
    )) ||
    (latestData.humidity && config && (
      latestData.humidity < config.humidity_alert_min ||
      latestData.humidity > config.humidity_alert_max
    )) ||
    (latestData.water_level && config && latestData.water_level > config.water_level_alert)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden shadow-md h-44">
        <img 
          src={heroImage} 
          alt="DAEA Sistema" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h1 className="text-2xl font-bold mb-1">DAEA</h1>
          <p className="text-xs text-white/90">
            Sistema de Monitoramento Automatizado de Evaporação de Água
          </p>
        </div>
        {isOnline && (
          <div className="absolute top-3 right-3">
            <div className="status-online bg-white/90 text-green-700">
              <div className="status-dot-online" />
              Online
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center bg-card border-border shadow-sm">
          <Activity className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-xl font-bold text-foreground">{totalReadings}</p>
          <p className="text-xs text-muted-foreground">Leituras</p>
        </Card>
        
        <Card className="p-4 text-center bg-card border-border shadow-sm">
          <Thermometer className="h-5 w-5 text-blue-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-foreground">{avgTemperature}°</p>
          <p className="text-xs text-muted-foreground">Média</p>
        </Card>
        
        <Card className="p-4 text-center bg-card border-border shadow-sm">
          <Droplets className="h-5 w-5 text-cyan-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-foreground">{avgHumidity}%</p>
          <p className="text-xs text-muted-foreground">Umidade</p>
        </Card>
      </div>

      {/* Alerts Card */}
      {hasAlerts && (
        <Card className="card-daea border-orange-300 bg-orange-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">Atenção</h3>
              <p className="text-sm text-orange-700 mb-3">
                Alguns parâmetros estão fora dos limites configurados
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onNavigate('sensors')}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Ver Detalhes
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Latest Readings */}
      {latestData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Leituras Atuais
            </h2>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onNavigate('sensors')}
              className="text-primary"
            >
              Ver Todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="sensor-card">
              <div className="p-2 rounded-lg bg-blue-50">
                <Thermometer className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Temperatura</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestData.temperature ? `${latestData.temperature}°C` : '--'}
                </p>
              </div>
            </div>

            <div className="sensor-card">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Droplets className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Umidade</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestData.humidity ? `${latestData.humidity}%` : '--'}
                </p>
              </div>
            </div>

            <div className="sensor-card">
              <div className="p-2 rounded-lg bg-green-50">
                <Gauge className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Nível Água</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestData.water_level ? `${latestData.water_level}cm` : '--'}
                </p>
              </div>
            </div>

            <div className="sensor-card">
              <div className="p-2 rounded-lg bg-purple-50">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Evaporação</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestData.evaporation_rate ? `${latestData.evaporation_rate}mm/h` : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <Card className="card-daea-highlight">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Status do Sistema</h3>
            <p className="text-sm text-muted-foreground">
              {currentDevice ? currentDevice.name : 'Nenhum dispositivo'}
            </p>
          </div>
          <Badge 
            variant={isOnline ? "default" : "secondary"}
            className="text-base px-4 py-2"
          >
            {isOnline ? '🟢 Ligado' : '🔴 Desligado'}
          </Badge>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => onNavigate('sensors')}
        >
          <Activity className="h-5 w-5" />
          <span className="text-xs">Sensores</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => onNavigate('history')}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs">Histórico</span>
        </Button>
      </div>
    </div>
  );
};

export default HomeScreen;
