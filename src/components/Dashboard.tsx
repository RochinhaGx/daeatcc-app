import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power, Droplets, Thermometer, Gauge, Zap, Settings, RefreshCw } from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { useSensorData } from '@/hooks/useSensorData';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { devices, loading: devicesLoading, createDevice, toggleDeviceStatus } = useDevices();
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const { latestData, simulateSensorData, loading: sensorLoading } = useSensorData(currentDevice?.id);
  const { config, createConfig } = useSystemConfig(currentDevice?.id);
  const { toast } = useToast();

  // Initialize device on first load
  useEffect(() => {
    if (!devicesLoading && devices.length === 0) {
      // Create default device if none exists
      createDevice('DAEA Dispositivo Principal', 'Sistema Principal');
    } else if (devices.length > 0) {
      setCurrentDevice(devices[0]);
    }
  }, [devices, devicesLoading]);

  // Create config if device exists but no config
  useEffect(() => {
    if (currentDevice && !config) {
      createConfig(currentDevice.id);
    }
  }, [currentDevice, config]);

  const handleToggleDevice = async () => {
    if (!currentDevice) return;
    await toggleDeviceStatus(currentDevice.id);
    
    // Update local state
    setCurrentDevice(prev => ({
      ...prev,
      status: prev.status === 'ligado' ? 'desligado' : 'ligado'
    }));
  };

  const handleSimulateReading = async () => {
    if (!currentDevice) return;
    
    if (currentDevice.status === 'desligado') {
      toast({
        title: "Sistema Desligado",
        description: "Ligue o sistema primeiro para simular leituras",
        variant: "destructive"
      });
      return;
    }

    await simulateSensorData(currentDevice.id);
    toast({
      title: "Leitura Simulada",
      description: "Nova leitura dos sensores foi registrada",
    });
  };

  const isOnline = currentDevice?.status === 'ligado';

  if (devicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">DAEA - Dashboard</h1>
        <p className="text-muted-foreground">Sistema de Monitoramento Inteligente</p>
        {currentDevice && (
          <p className="text-sm text-muted-foreground mt-1">{currentDevice.name}</p>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="card-daea">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Power className={`h-6 w-6 ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Status</p>
              <Badge variant={isOnline ? "default" : "secondary"} className="mt-1">
                {currentDevice?.status === 'ligado' ? 'Ligado' : 'Desligado'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="card-daea">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Zap className={`h-6 w-6 ${config?.auto_evaporation ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Evaporação</p>
              <Badge variant="outline" className="mt-1">
                {config?.auto_evaporation ? 'Automática' : 'Manual'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="btn-daea w-full max-w-xs"
          onClick={handleToggleDevice}
          disabled={!currentDevice}
        >
          <Power className="mr-2 h-5 w-5" />
          {currentDevice?.status === 'ligado' ? 'Desligar Sistema' : 'Ligar Sistema'}
        </Button>
      </div>

      {/* Sensor Readings */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="card-daea">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Temperatura</p>
                <p className="text-2xl font-bold">
                  {latestData?.temperature ? `${latestData.temperature}°C` : '--°C'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "outline"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </Card>

        <Card className="card-daea">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Droplets className="h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm font-medium">Umidade</p>
                <p className="text-2xl font-bold">
                  {latestData?.humidity ? `${latestData.humidity}%` : '--%'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "outline"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </Card>

        <Card className="card-daea">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gauge className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Nível da Água</p>
                <p className="text-2xl font-bold">
                  {latestData?.water_level ? `${latestData.water_level}cm` : '--cm'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "outline"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </Card>

        <Card className="card-daea">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Taxa de Evaporação</p>
                <p className="text-2xl font-bold">
                  {latestData?.evaporation_rate ? `${latestData.evaporation_rate}mm/h` : '--mm/h'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "outline"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleSimulateReading}
          disabled={!isOnline}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Simular Leitura
        </Button>
        <Button variant="outline" disabled={!isOnline}>
          <Settings className="mr-2 h-4 w-4" />
          Calibrar Sensores
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;