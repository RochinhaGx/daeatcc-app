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
import { Bluetooth, Wifi, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface ESP32ConnectionDialogProps {
  deviceId?: string;
}

const ESP32ConnectionDialog: React.FC<ESP32ConnectionDialogProps> = ({ deviceId }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'bluetooth' | 'wifi' | null>(null);
  const { toast } = useToast();

  const handleBluetoothConnect = async () => {
    setIsConnecting(true);
    setConnectionType('bluetooth');

    try {
      // Check if Web Bluetooth API is available
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth não é suportado neste navegador. Use Chrome, Edge ou Opera.');
      }

      // Request Bluetooth device
      const device = await nav.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP32' },
          { namePrefix: 'DAEA' }
        ],
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // Generic UART service UUID
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
          description: `ESP32 (${device.name}) conectado via Bluetooth`,
        });

        // Send device ID to ESP32 if available
        if (deviceId) {
          try {
            const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
            const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
            
            // Send device ID
            const encoder = new TextEncoder();
            const data = encoder.encode(`DEVICE_ID:${deviceId}`);
            await characteristic.writeValue(data);
            
            toast({
              title: "Configurado",
              description: "ID do dispositivo enviado ao ESP32"
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
            description: "ESP32 foi desconectado",
            variant: "destructive"
          });
        });
      }
    } catch (error: any) {
      console.error('Bluetooth connection error:', error);
      toast({
        title: "Erro de conexão",
        description: error.message || "Não foi possível conectar ao ESP32 via Bluetooth",
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
          Conectar ESP32
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Conectar ao ESP32</DialogTitle>
          <DialogDescription>
            Escolha o método de conexão com seu dispositivo ESP32
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bluetooth" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bluetooth">
              <Bluetooth className="mr-2 h-4 w-4" />
              Bluetooth
            </TabsTrigger>
            <TabsTrigger value="wifi">
              <Wifi className="mr-2 h-4 w-4" />
              WiFi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bluetooth" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Conexão via Bluetooth</h4>
                <p className="text-sm text-muted-foreground">
                  Certifique-se de que o Bluetooth está ativado no ESP32 e no seu dispositivo.
                </p>
              </div>

              {isConnected && connectionType === 'bluetooth' ? (
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
                <p>• O ESP32 deve estar próximo e ligado</p>
                <p>• Nome do dispositivo deve começar com "ESP32" ou "DAEA"</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="wifi" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Conexão via WiFi</h4>
                <p className="text-sm text-muted-foreground">
                  Configure o ESP32 para se conectar à mesma rede WiFi.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">1. Configure o WiFi no ESP32:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs">
                    <p>const char* ssid = "SUA_REDE";</p>
                    <p>const char* password = "SUA_SENHA";</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-medium">2. Configure a URL da API:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">
                    <p>String apiUrl = "https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-data";</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-medium">3. Configure a chave de API:</p>
                  <p className="text-xs text-muted-foreground">
                    Encontre a chave ESP32_API_KEY no backend do projeto
                  </p>
                </div>

                {deviceId && (
                  <div className="space-y-1">
                    <p className="font-medium">4. ID do seu dispositivo:</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">
                      <p>{deviceId}</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 Consulte o arquivo ESP32_SETUP.md para instruções completas de configuração
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ESP32ConnectionDialog;
