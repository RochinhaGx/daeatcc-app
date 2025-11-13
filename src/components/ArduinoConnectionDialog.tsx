import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bluetooth, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface ArduinoConnectionDialogProps {
  deviceId?: string;
}

const ArduinoConnectionDialog: React.FC<ArduinoConnectionDialogProps> = ({ deviceId }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleBluetoothConnect = async () => {
    setIsConnecting(true);

    try {
      // Check if Web Bluetooth API is available
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth não é suportado neste navegador. Use Chrome, Edge ou Opera.');
      }

      // Request Bluetooth device - HC-05 aparece como dispositivo serial
      const device = await nav.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'HC-05' },
          { namePrefix: 'HC-' },
          { namePrefix: 'DAEA' },
          { namePrefix: 'linvor' }, // Algumas versões do HC-05 aparecem com esse nome
          { name: 'HC-05' }
        ],
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // Generic UART service UUID for serial
      });

      toast({
        title: "Dispositivo encontrado",
        description: `Conectando ao ${device.name}...`
      });

      // Connect to GATT server
      const server = await device.gatt?.connect();
      
      if (server) {
        setIsConnected(true);
        toast({
          title: "Conectado!",
          description: `Arduino (${device.name}) conectado via Bluetooth`,
        });

        // Send device ID to Arduino if available
        if (deviceId) {
          try {
            const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
            const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
            
            // Send device ID
            const encoder = new TextEncoder();
            const data = encoder.encode(`DEVICE_ID:${deviceId}\n`);
            await characteristic.writeValue(data);
            
            toast({
              title: "Configurado",
              description: "ID do dispositivo enviado ao Arduino"
            });
          } catch (error) {
            console.error('Error sending device ID:', error);
          }
        }

        // Handle disconnect
        device.addEventListener('gattserverdisconnected', () => {
          setIsConnected(false);
          toast({
            title: "Desconectado",
            description: "Arduino foi desconectado",
            variant: "destructive"
          });
        });
      }
    } catch (error: any) {
      console.error('Bluetooth connection error:', error);
      toast({
        title: "Erro de conexão",
        description: error.message || "Não foi possível conectar ao Arduino via Bluetooth",
        variant: "destructive"
      });
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bluetooth className="mr-2 h-4 w-4" />
          Conectar Arduino
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Conectar ao Arduino</DialogTitle>
          <DialogDescription>
            Conecte seu Arduino Uno com módulo HC-05 via Bluetooth
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bluetooth" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="bluetooth">
              <Bluetooth className="mr-2 h-4 w-4" />
              Bluetooth HC-05
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bluetooth" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Conexão via Bluetooth HC-05</h4>
                <p className="text-sm text-muted-foreground">
                  Certifique-se de que o módulo HC-05 está ligado e o LED está piscando.
                </p>
              </div>

              {isConnected ? (
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-600 font-medium">Conectado via Bluetooth</span>
                </div>
              ) : (
                <Button 
                  onClick={handleBluetoothConnect} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="mr-2 h-4 w-4" />
                      Conectar via Bluetooth
                    </>
                  )}
                </Button>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Navegadores suportados: Chrome, Edge, Opera</p>
                <p>• O Arduino deve estar ligado com HC-05 funcionando</p>
                <p>• O LED do HC-05 deve estar piscando rapidamente</p>
                <p>• Nome do dispositivo: "HC-05", "DAEA" ou "linvor"</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ArduinoConnectionDialog;
