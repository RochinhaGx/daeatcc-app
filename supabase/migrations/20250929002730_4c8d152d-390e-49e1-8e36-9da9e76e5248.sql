-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar tabela para dispositivos DAEA
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'DAEA Dispositivo',
  status TEXT NOT NULL DEFAULT 'desligado' CHECK (status IN ('ligado', 'desligado')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para dados dos sensores
CREATE TABLE public.sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  temperature DECIMAL(5,2), -- Temperatura em °C
  humidity DECIMAL(5,2), -- Umidade em %
  water_level DECIMAL(6,2), -- Nível da água em cm
  evaporation_rate DECIMAL(5,2), -- Taxa de evaporação
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do sistema
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  temperature_alert_min DECIMAL(5,2) DEFAULT 15.0,
  temperature_alert_max DECIMAL(5,2) DEFAULT 35.0,
  humidity_alert_min DECIMAL(5,2) DEFAULT 30.0,
  humidity_alert_max DECIMAL(5,2) DEFAULT 90.0,
  water_level_alert DECIMAL(6,2) DEFAULT 50.0,
  auto_evaporation BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para devices
CREATE POLICY "Users can view their own devices" 
ON public.devices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own devices" 
ON public.devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
ON public.devices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
ON public.devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para sensor_data
CREATE POLICY "Users can view their own sensor data" 
ON public.sensor_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sensor data" 
ON public.sensor_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para system_config
CREATE POLICY "Users can view their own config" 
ON public.system_config 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own config" 
ON public.system_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" 
ON public.system_config 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_sensor_data_device_id ON public.sensor_data(device_id);
CREATE INDEX idx_sensor_data_timestamp ON public.sensor_data(timestamp DESC);
CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_system_config_device_id ON public.system_config(device_id);