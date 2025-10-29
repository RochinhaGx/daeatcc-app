import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SensorData {
  id: string;
  device_id: string;
  user_id: string;
  temperature?: number;
  humidity?: number;
  water_level?: number;
  evaporation_rate?: number;
  timestamp: string;
}

export const useSensorData = (deviceId?: string) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSensorData = async (limit = 50) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('sensor_data')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setSensorData(data || []);
      if (data && data.length > 0) {
        setLatestData(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos sensores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos sensores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSensorReading = async (reading: Omit<SensorData, 'id' | 'user_id' | 'timestamp'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .insert({
          ...reading,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchSensorData(); // Refresh the data
      return data;
    } catch (error) {
      console.error('Erro ao adicionar leitura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a leitura do sensor",
        variant: "destructive"
      });
      return null;
    }
  };

  // Simular leituras dos sensores para demonstração com dados realistas
  const simulateSensorData = async (deviceId: string) => {
    // Dados do DHT22 - mais realistas
    const temperature = Math.round((Math.random() * 10 + 22) * 100) / 100; // 22-32°C
    const humidity = Math.round((Math.random() * 30 + 45) * 100) / 100; // 45-75%
    
    // Nível de água em cm (simulando um reservatório)
    const water_level = Math.round((Math.random() * 50 + 30) * 100) / 100; // 30-80cm
    
    // Taxa de evaporação calculada com base na temperatura e umidade
    // Quanto maior a temperatura e menor a umidade, maior a evaporação
    const tempFactor = (temperature - 20) / 10; // Normalizado
    const humidityFactor = (100 - humidity) / 100; // Invertido e normalizado
    const evaporation_rate = Math.round((tempFactor * 2 + humidityFactor * 3) * 100) / 100; // mm/h
    
    const readings = {
      device_id: deviceId,
      temperature,
      humidity,
      water_level,
      evaporation_rate,
    };

    return await addSensorReading(readings);
  };

  const getDataByTimeRange = (hours: number) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return sensorData.filter(data => 
      new Date(data.timestamp) >= cutoff
    );
  };

  useEffect(() => {
    if (user) {
      fetchSensorData();
      
      // Gerar dados simulados a cada 10 segundos se houver um deviceId
      if (deviceId) {
        const interval = setInterval(() => {
          simulateSensorData(deviceId);
        }, 10000);
        
        return () => clearInterval(interval);
      }
    }
  }, [user, deviceId]);

  return {
    sensorData,
    latestData,
    loading,
    addSensorReading,
    simulateSensorData,
    getDataByTimeRange,
    refetch: fetchSensorData
  };
};