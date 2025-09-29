import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Device {
  id: string;
  user_id: string;
  name: string;
  status: 'ligado' | 'desligado';
  location?: string;
  created_at: string;
  updated_at: string;
}

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDevices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices((data || []) as Device[]);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dispositivos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDevice = async (name: string, location?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('devices')
        .insert({
          user_id: user.id,
          name,
          location,
          status: 'desligado'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchDevices(); // Refresh the list
      toast({
        title: "Sucesso",
        description: "Dispositivo criado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o dispositivo",
        variant: "destructive"
      });
      return null;
    }
  };

  const toggleDeviceStatus = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newStatus = device.status === 'ligado' ? 'desligado' : 'ligado';

    try {
      const { error } = await supabase
        .from('devices')
        .update({ status: newStatus })
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, status: newStatus } : d
      ));

      toast({
        title: `Dispositivo ${newStatus}`,
        description: `${device.name} foi ${newStatus} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar status do dispositivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do dispositivo",
        variant: "destructive"
      });
    }
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    try {
      const { error } = await supabase
        .from('devices')
        .update(updates)
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, ...updates } : d
      ));

      toast({
        title: "Sucesso",
        description: "Dispositivo atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o dispositivo",
        variant: "destructive"
      });
    }
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(prev => prev.filter(d => d.id !== deviceId));
      
      toast({
        title: "Sucesso",
        description: "Dispositivo removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar dispositivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o dispositivo",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchDevices();
    }
  }, [user]);

  return {
    devices,
    loading,
    createDevice,
    toggleDeviceStatus,
    updateDevice,
    deleteDevice,
    refetch: fetchDevices
  };
};