import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Thermometer, Droplets, Gauge, Download, Zap, RefreshCw } from 'lucide-react';
import { useSensorData } from '@/hooks/useSensorData';
import { useDevices } from '@/hooks/useDevices';
import { useToast } from '@/hooks/use-toast';

const HistoryScreen = () => {
  const { devices } = useDevices();
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const { sensorData, loading, refetch } = useSensorData(currentDevice?.id);
  const { toast } = useToast();

  useEffect(() => {
    if (devices.length > 0) {
      setCurrentDevice(devices[0]);
    }
  }, [devices]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (data: any) => {
    if (!data.temperature || !data.humidity || !data.water_level) {
      return { variant: 'outline' as const, text: 'Incompleto' };
    }

    // Check for alerts based on typical ranges
    const tempOutOfRange = data.temperature < 15 || data.temperature > 35;
    const humidityOutOfRange = data.humidity < 30 || data.humidity > 90;
    const waterLevelHigh = data.water_level > 80;

    if (tempOutOfRange || humidityOutOfRange || waterLevelHigh) {
      return { variant: 'destructive' as const, text: 'Alerta' };
    }

    return { variant: 'default' as const, text: 'Normal' };
  };

  const handleExportData = () => {
    if (sensorData.length === 0) {
      toast({
        title: "Sem Dados",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    // Convert data to CSV format
    const headers = ['Data/Hora', 'Temperatura (°C)', 'Umidade (%)', 'Nível Água (cm)', 'Taxa Evaporação (mm/h)', 'Status'];
    const csvData = [
      headers.join(','),
      ...sensorData.map(data => {
        const status = getStatusBadge(data);
        return [
          formatDate(data.timestamp),
          data.temperature || '--',
          data.humidity || '--',
          data.water_level || '--',
          data.evaporation_rate || '--',
          status.text
        ].join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daea_historico_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Dados Exportados",
      description: "Arquivo CSV foi baixado com sucesso",
    });
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
        <h1 className="text-2xl font-bold mb-2">Histórico de Sensores</h1>
        <p className="text-muted-foreground">Dados coletados do sistema DAEA</p>
        {currentDevice && (
          <p className="text-sm text-muted-foreground mt-1">{currentDevice.name}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportData}
          disabled={sensorData.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {sensorData.map((data) => {
          const status = getStatusBadge(data);
          return (
            <Card key={data.id} className="card-daea">
              <div className="space-y-4">
                {/* Timestamp and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatDate(data.timestamp)}</span>
                  </div>
                  <Badge variant={status.variant} className="text-xs">
                    {status.text}
                  </Badge>
                </div>

                {/* Sensor Readings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-blue-500" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Temp</p>
                      <p className="text-sm font-bold">
                        {data.temperature ? `${data.temperature}°C` : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Umidade</p>
                      <p className="text-sm font-bold">
                        {data.humidity ? `${data.humidity}%` : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-green-500" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Nível</p>
                      <p className="text-sm font-bold">
                        {data.water_level ? `${data.water_level}cm` : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Evaporação</p>
                      <p className="text-sm font-bold">
                        {data.evaporation_rate ? `${data.evaporation_rate}mm/h` : '--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {sensorData.length === 0 && (
        <Card className="card-daea">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Os dados dos sensores aparecerão aqui conforme forem coletados
            </p>
            <p className="text-sm text-muted-foreground">
              Ligue o sistema e use "Simular Leitura" no Dashboard para gerar dados de teste
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HistoryScreen;