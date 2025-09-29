import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Thermometer, Droplets, Gauge, LogOut, Save, RotateCcw, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDevices } from '@/hooks/useDevices';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useToast } from '@/hooks/use-toast';

const ConfigScreen = () => {
  const { signOut } = useAuth();
  const { devices } = useDevices();
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const { config, loading, createConfig, updateConfig, resetToDefaults } = useSystemConfig(currentDevice?.id);
  const { toast } = useToast();

  // Local state for form values
  const [formData, setFormData] = useState({
    temperature_alert_min: 15.0,
    temperature_alert_max: 35.0,
    humidity_alert_min: 30.0,
    humidity_alert_max: 90.0,
    water_level_alert: 50.0,
    auto_evaporation: true,
    notification_enabled: true,
  });

  useEffect(() => {
    if (devices.length > 0) {
      setCurrentDevice(devices[0]);
    }
  }, [devices]);

  useEffect(() => {
    if (config) {
      setFormData({
        temperature_alert_min: config.temperature_alert_min,
        temperature_alert_max: config.temperature_alert_max,
        humidity_alert_min: config.humidity_alert_min,
        humidity_alert_max: config.humidity_alert_max,
        water_level_alert: config.water_level_alert,
        auto_evaporation: config.auto_evaporation,
        notification_enabled: config.notification_enabled,
      });
    }
  }, [config]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleSave = async () => {
    if (!currentDevice) {
      toast({
        title: "Erro",
        description: "Nenhum dispositivo selecionado",
        variant: "destructive"
      });
      return;
    }

    if (!config) {
      // Create new config
      await createConfig(currentDevice.id, formData);
    } else {
      // Update existing config
      await updateConfig(formData);
    }
  };

  const handleReset = async () => {
    if (!config) {
      // Reset form to defaults
      setFormData({
        temperature_alert_min: 15.0,
        temperature_alert_max: 35.0,
        humidity_alert_min: 30.0,
        humidity_alert_max: 90.0,
        water_level_alert: 50.0,
        auto_evaporation: true,
        notification_enabled: true,
      });
    } else {
      await resetToDefaults();
    }
  };

  const handleInputChange = (field: string, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Ajustes do sistema DAEA</p>
        {currentDevice && (
          <p className="text-sm text-muted-foreground mt-1">{currentDevice.name}</p>
        )}
      </div>

      {/* Device Settings */}
      <Card className="card-daea">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Configurações do Dispositivo</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-mode">Evaporação Automática</Label>
                <p className="text-sm text-muted-foreground">Ativa o sistema automaticamente quando necessário</p>
              </div>
              <Switch 
                id="auto-mode" 
                checked={formData.auto_evaporation}
                onCheckedChange={(checked) => handleInputChange('auto_evaporation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificações</Label>
                <p className="text-sm text-muted-foreground">Receba alertas sobre o sistema</p>
              </div>
              <Switch 
                id="notifications" 
                checked={formData.notification_enabled}
                onCheckedChange={(checked) => handleInputChange('notification_enabled', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card className="card-daea">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Limites de Alerta</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-blue-500" />
                <Label>Temperatura (°C)</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="number"
                  placeholder="Min"
                  value={formData.temperature_alert_min}
                  onChange={(e) => handleInputChange('temperature_alert_min', parseFloat(e.target.value) || 0)}
                />
                <Input 
                  type="number"
                  placeholder="Max"
                  value={formData.temperature_alert_max}
                  onChange={(e) => handleInputChange('temperature_alert_max', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <Label>Umidade (%)</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="number"
                  placeholder="Min"
                  value={formData.humidity_alert_min}
                  onChange={(e) => handleInputChange('humidity_alert_min', parseFloat(e.target.value) || 0)}
                />
                <Input 
                  type="number"
                  placeholder="Max"
                  value={formData.humidity_alert_max}
                  onChange={(e) => handleInputChange('humidity_alert_max', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-green-500" />
                <Label>Nível da Água - Alerta (cm)</Label>
              </div>
              <Input 
                type="number"
                placeholder="Nível de alerta"
                value={formData.water_level_alert}
                onChange={(e) => handleInputChange('water_level_alert', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* System Actions */}
      <Card className="card-daea">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ações do Sistema</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleSave} className="btn-daea">
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
            
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar Padrões
            </Button>
            
            <Button variant="outline" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Calibrar Sensores
            </Button>
          </div>
        </div>
      </Card>

      {/* Device Info */}
      {currentDevice && (
        <Card className="card-daea">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Informações do Dispositivo</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Nome:</span> {currentDevice.name}</p>
              <p><span className="font-medium">Status:</span> {currentDevice.status === 'ligado' ? 'Ligado' : 'Desligado'}</p>
              <p><span className="font-medium">Localização:</span> {currentDevice.location || 'Não definida'}</p>
              <p><span className="font-medium">Criado em:</span> {new Date(currentDevice.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </Card>
      )}

      <Separator />

      {/* Logout */}
      <div className="flex justify-center">
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default ConfigScreen;