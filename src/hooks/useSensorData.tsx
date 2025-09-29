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

  // Simular leituras dos sensores para demonstração
  const simulateSensorData = async (deviceId: string) => {
    const readings = {
      device_id: deviceId,
      temperature: Math.round((Math.random() * 20 + 15) * 100) / 100, // 15-35°C
      humidity: Math.round((Math.random() * 60 + 30) * 100) / 100, // 30-90%
      water_level: Math.round((Math.random() * 100) * 100) / 100, // 0-100cm
      evaporation_rate: Math.round((Math.random() * 5 + 1) * 100) / 100, // 1-6 mm/h
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