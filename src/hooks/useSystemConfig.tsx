import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SystemConfig {
  id: string;
  user_id: string;
  device_id: string;
  temperature_alert_min: number;
  temperature_alert_max: number;
  humidity_alert_min: number;
  humidity_alert_max: number;
  water_level_alert: number;
  auto_evaporation: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useSystemConfig = (deviceId?: string) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConfig = async () => {
    if (!user || !deviceId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      setConfig(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (deviceId: string, configData?: Partial<SystemConfig>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('system_config')
        .insert({
          user_id: user.id,
          device_id: deviceId,
          temperature_alert_min: configData?.temperature_alert_min ?? 15.0,
          temperature_alert_max: configData?.temperature_alert_max ?? 35.0,
          humidity_alert_min: configData?.humidity_alert_min ?? 30.0,
          humidity_alert_max: configData?.humidity_alert_max ?? 90.0,
          water_level_alert: configData?.water_level_alert ?? 50.0,
          auto_evaporation: configData?.auto_evaporation ?? true,
          notification_enabled: configData?.notification_enabled ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      
      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configuração criada com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a configuração",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateConfig = async (updates: Partial<SystemConfig>) => {
    if (!config) return null;

    try {
      const { data, error } = await supabase
        .from('system_config')
        .update(updates)
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive"
      });
      return null;
    }
  };

  const resetToDefaults = async () => {
    if (!config) return null;

    const defaults = {
      temperature_alert_min: 15.0,
      temperature_alert_max: 35.0,
      humidity_alert_min: 30.0,
      humidity_alert_max: 90.0,
      water_level_alert: 50.0,
      auto_evaporation: true,
      notification_enabled: true,
    };

    return await updateConfig(defaults);
  };

  useEffect(() => {
    if (user && deviceId) {
      fetchConfig();
    }
  }, [user, deviceId]);

  return {
    config,
    loading,
    createConfig,
    updateConfig,
    resetToDefaults,
    refetch: fetchConfig
  };
};