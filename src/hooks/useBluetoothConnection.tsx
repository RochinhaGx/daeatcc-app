import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface BluetoothData {
  soilHumidity: number;
  rawValue: number;
  relayStatus: 'ON' | 'OFF';
  mode: 'AUTO' | 'MANUAL';
}

export const useBluetoothConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [latestData, setLatestData] = useState<BluetoothData | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth não é suportado. Use Chrome, Edge ou Opera.');
      }

      // Request device
      const btDevice = await nav.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'HC-05' },
          { namePrefix: 'HC-' },
          { namePrefix: 'DAEA' },
          { namePrefix: 'linvor' },
          { name: 'HC-05' }
        ],
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
      });

      toast({
        title: "Conectando...",
        description: `Conectando ao ${btDevice.name}...`
      });

      // Connect to GATT
      const server = await btDevice.gatt?.connect();
      if (!server) throw new Error('Falha ao conectar ao GATT server');

      // Get service and characteristic
      const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      const char = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

      // Start notifications to receive data
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', handleNotifications);

      setDevice(btDevice);
      setCharacteristic(char);
      setIsConnected(true);

      // Handle disconnect
      btDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setDevice(null);
        setCharacteristic(null);
        toast({
          title: "Desconectado",
          description: "Arduino foi desconectado",
          variant: "destructive"
        });
      });

      toast({
        title: "Conectado!",
        description: `${btDevice.name} conectado com sucesso`,
      });

    } catch (error: any) {
      console.error('Bluetooth error:', error);
      toast({
        title: "Erro de conexão",
        description: error.message || "Não foi possível conectar ao Arduino",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const handleNotifications = (event: any) => {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(value);
    
    console.log('📱 Dados recebidos:', text);

    // Parse data: DADOS|45|620|ON|AUTO
    if (text.startsWith('DADOS|')) {
      const parts = text.replace('DADOS|', '').split('|');
      if (parts.length >= 4) {
        setLatestData({
          soilHumidity: parseInt(parts[0]) || 0,
          rawValue: parseInt(parts[1]) || 0,
          relayStatus: parts[2] as 'ON' | 'OFF',
          mode: parts[3] as 'AUTO' | 'MANUAL'
        });
      }
    }
  };

  const sendCommand = useCallback(async (command: string) => {
    if (!characteristic || !isConnected) {
      toast({
        title: "Erro",
        description: "Arduino não está conectado",
        variant: "destructive"
      });
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');
      await characteristic.writeValue(data);
      
      console.log('📤 Comando enviado:', command);
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar comando:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar comando",
        variant: "destructive"
      });
      return false;
    }
  }, [characteristic, isConnected, toast]);

  const turnOn = useCallback(async () => {
    const success = await sendCommand('LIGAR');
    if (success) {
      toast({
        title: "Sistema Ligado",
        description: "🟢 Arduino ativado via app"
      });
    }
    return success;
  }, [sendCommand, toast]);

  const turnOff = useCallback(async () => {
    const success = await sendCommand('DESLIGAR');
    if (success) {
      toast({
        title: "Sistema Desligado",
        description: "⚫ Arduino desativado via app"
      });
    }
    return success;
  }, [sendCommand, toast]);

  const setAutoMode = useCallback(async () => {
    const success = await sendCommand('AUTO');
    if (success) {
      toast({
        title: "Modo Automático",
        description: "🔄 Sistema controlado pelo sensor"
      });
    }
    return success;
  }, [sendCommand, toast]);

  const getStatus = useCallback(async () => {
    return await sendCommand('STATUS');
  }, [sendCommand]);

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setIsConnected(false);
    setDevice(null);
    setCharacteristic(null);
    setLatestData(null);
  }, [device]);

  return {
    isConnected,
    isConnecting,
    latestData,
    connect,
    disconnect,
    turnOn,
    turnOff,
    setAutoMode,
    getStatus,
    sendCommand
  };
};
