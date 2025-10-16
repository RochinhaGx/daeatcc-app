# 🌐 Configuração do ESP32 com WiFi para o App DAEA

## 📡 Conexão WiFi - Envio Automático de Dados + Controle Remoto

O ESP32 se conecta ao WiFi, envia dados automaticamente E permite controle remoto do sistema através do app!

## 📋 O Que Você Precisa

1. **Hardware:**
   - ESP32
   - Sensor DHT11 (temperatura e umidade do ar)
   - Sensor de umidade do solo (analógico)
   - Display LCD I2C 16x2
   - Relé (opcional - para controlar equipamentos)
   - Conexão WiFi 2.4GHz disponível

2. **Software:**
   - Arduino IDE com suporte para ESP32
   - Bibliotecas: WiFi.h, HTTPClient.h, Wire.h, LiquidCrystal_I2C.h, DHT.h

## 🚀 Configuração Passo a Passo

### 1. Obter as Credenciais no App

Antes de programar o ESP32, você precisa:

1. **Criar um dispositivo no app:**
   - Faça login no app DAEA
   - Vá para "Configurações"
   - Anote o **Device ID** do seu dispositivo (exemplo: `550e8400-e29b-41d4-a716-446655440000`)

2. **Obter a API Key:**
   - A API Key já está configurada no sistema
   - (Entre em contato com o administrador para obter a chave)

### 2. Configurar o Código do ESP32

Abra o arquivo `ESP32_WIFI_CODE.ino` e modifique estas linhas:

```cpp
// --- CONFIGURAÇÕES WIFI ---
const char* ssid = "SEU_WIFI_AQUI";           // Nome da sua rede WiFi
const char* password = "SUA_SENHA_AQUI";      // Senha da sua rede WiFi

// --- CONFIGURAÇÕES DO SERVIDOR ---
const char* apiKey = "SUA_API_KEY_AQUI";      // API Key do sistema
const char* deviceId = "SEU_DEVICE_ID_AQUI";  // ID do dispositivo (copie do app)
```

**Exemplo configurado:**
```cpp
const char* ssid = "MinhaRedeWiFi";
const char* password = "minha_senha_123";
const char* apiKey = "abc123def456";
const char* deviceId = "550e8400-e29b-41d4-a716-446655440000";
```

### 3. Instalar Bibliotecas Necessárias

No Arduino IDE:

1. **DHT Sensor Library:**
   - Vá em **Sketch → Include Library → Manage Libraries**
   - Procure por "DHT sensor library"
   - Instale "DHT sensor library" by Adafruit
   - Instale também "Adafruit Unified Sensor"

2. **LiquidCrystal I2C:**
   - Procure por "LiquidCrystal I2C"
   - Instale a biblioteca

3. **WiFi e HTTPClient** já vêm com o ESP32

### 4. Upload para o ESP32

1. Conecte o ESP32 ao computador via USB
2. Abra a Arduino IDE
3. Selecione a placa: **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
4. Selecione a porta COM correta
5. Clique em **Upload**

### 5. Verificar Conexão

Após o upload:

1. **Monitor Serial:** Abra o Monitor Serial (115200 baud) para ver os logs
2. **Display LCD:** Verá "Conectando WiFi" e depois "WiFi OK!" com o IP
3. **Status de Envio:** O LCD mostra "OK", "ERR" ou "FAIL" no canto inferior direito

## 📊 Como Funciona

O ESP32 faz o seguinte automaticamente:

1. **Conecta ao WiFi** na inicialização
2. **Verifica status** do sistema no servidor a cada 5 segundos
3. **Recebe comandos** remotos (ligar/desligar via app)
4. **Lê os sensores** a cada 2 segundos:
   - Temperatura e umidade do ar (DHT11)
   - Umidade do solo (sensor analógico)
5. **Exibe no LCD** os valores atuais + status (ON/OFF)
6. **Controla relé** baseado no status do sistema
7. **Envia dados para o servidor** a cada 10 segundos (apenas quando ligado)
8. **Mostra status** de conexão e envio no LCD

### Dados Enviados

```json
{
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "temperature": 25.5,
  "humidity": 65.2,
  "water_level": 78.0
}
```

**Nota:** O campo `water_level` é usado para a umidade do solo neste caso.

## 🔧 Conexões do Hardware

### DHT11 (Temperatura e Umidade):
- VCC → 3.3V ou 5V
- GND → GND
- Data → GPIO 4

### Sensor de Umidade do Solo:
- VCC → 3.3V
- GND → GND
- A0 → GPIO 34 (ADC)

### LCD I2C 16x2:
- VCC → 5V
- GND → GND
- SDA → GPIO 21
- SCL → GPIO 22

### Relé (opcional):
- VCC → 5V
- GND → GND
- IN → GPIO 2
- COM, NO, NC → Equipamento a controlar

## 🔍 Monitoramento

### No Monitor Serial

Você verá logs detalhados como:
```
=== DAEA ESP32 Sistema Iniciando ===
Device ID: dec6c9b8-1ad1-44a6-a798-2bcfd9147817
✓ Sensor DHT11 inicializado
✓ LCD inicializado

--- Conectando ao WiFi ---
SSID: MinhaRedeWiFi
...
✓ WiFi conectado com sucesso!
✓ Endereço IP: 192.168.1.100
✓ Força do sinal: -45 dBm

--- Verificando status inicial ---
🔍 Verificando status do sistema...
✓ Resposta do servidor: {"success":true,"status":"ligado"}
✓ Sistema LIGADO remotamente!

=== Sistema pronto! ===

📊 T: 25.5°C | U: 65.0% | Solo: 78% | Sistema: LIGADO

📤 Enviando dados para o servidor...
---
🌡️  Temperatura: 25.50°C
💧 Umidade: 65.00%
🌊 Nível água: 78.00%
---
📦 Payload: {"device_id":"dec6c9b8...","temperature":25.50,"humidity":65.00,"water_level":78.00}
✓ Código HTTP: 200
✓ Resposta: {"success":true,"message":"Sensor data saved successfully"}
✓ Dados enviados com sucesso!
```

### No Display LCD

```
T:25.5C U:65% ON
Solo:78%     OK
```

**Indicadores de Status:**
- **ON/OFF**: Status do sistema (controlado remotamente)
- **OK**: Dados enviados com sucesso (HTTP 200)
- **ERR**: Erro no envio (código HTTP diferente de 200)
- **FAIL**: Falha na conexão HTTP
- **WIFI**: Falha na conexão WiFi

## ❗ Solução de Problemas

### WiFi não conecta

✅ **Verificações:**
1. SSID está correto (case sensitive)
2. Senha está correta
3. WiFi é 2.4GHz (ESP32 não suporta 5GHz)
4. ESP32 está no alcance do roteador
5. Tente resetar o ESP32 (botão EN)

### Dados não aparecem no app

✅ **Verificações:**
1. **Device ID correto:** Copie do app exatamente
2. **API Key correta:** Entre em contato com o admin
3. **Monitor Serial:** Verifique os códigos de resposta HTTP:
   - `200` = ✅ Sucesso
   - `401` = 🔑 API Key inválida
   - `404` = 📱 Device não encontrado
   - `500` = 🔥 Erro no servidor
4. **Dispositivo existe:** Crie o device no app primeiro

### Erro ao ler sensores DHT11

✅ **Soluções:**
- Verifique as conexões (VCC, GND, Data)
- Adicione resistor pull-up de 10kΩ entre VCC e Data
- Espere 2 segundos após ligar antes da primeira leitura
- Verifique se é DHT11 mesmo (não DHT22)

### Sensor de solo sempre retorna 0 ou 4095

✅ **Soluções:**
- Verifique se está conectado ao GPIO 34 (ADC1)
- Teste em solo seco vs molhado para ver mudança
- Inverta os valores se necessário (veja código)

### LCD não aparece nada

✅ **Soluções:**
- Verifique o endereço I2C (pode ser 0x27 ou 0x3F)
- No Arduino IDE, use o "I2C Scanner" para descobrir o endereço
- Ajuste o contraste girando o potenciômetro no LCD
- Verifique conexões SDA (GPIO 21) e SCL (GPIO 22)

## 🔧 Ajustes Opcionais

### Mudar intervalo de envio

No código, altere (em milissegundos):
```cpp
const unsigned long sendInterval = 10000; // 10 segundos

// Para 30 segundos:
const unsigned long sendInterval = 30000;

// Para 1 minuto:
const unsigned long sendInterval = 60000;
```

### Mudar intervalo de leitura dos sensores

No final do `loop()`:
```cpp
delay(2000); // 2 segundos

// Para 5 segundos:
delay(5000);
```

### Calibrar sensor de solo

Ajuste os valores de mapeamento:
```cpp
// Valor atual (4095 = seco, 0 = molhado)
umidade_percentual = map(umidade_solo, 4095, 0, 0, 100);

// Se estiver invertido, mude para:
umidade_percentual = map(umidade_solo, 0, 4095, 0, 100);

// Ou ajuste os limites conforme seu sensor:
umidade_percentual = map(umidade_solo, 3500, 500, 0, 100);
```

## 📱 Verificando e Controlando no App

1. **Abra o app DAEA** e faça login
2. **Na tela inicial:**
   - Veja o status do dispositivo (Ligado/Desligado)
   - Veja as últimas leituras dos sensores
3. **Na aba "Sensores" (Dashboard):**
   - **CLIQUE NO BOTÃO para ligar/desligar o sistema remotamente!**
   - O ESP32 vai detectar a mudança em até 5 segundos
   - Quando LIGADO, ele envia dados automaticamente
   - Quando DESLIGADO, ele apenas monitora mas não envia
4. **Na aba "Histórico":**
   - Veja todos os dados enviados pelo ESP32
   - Gráficos de evolução de temperatura, umidade, etc.
5. **Na aba "Configurações":**
   - Configure limites de alerta
   - Ajuste parâmetros do sistema
   - Veja o Device ID para configurar o ESP32

## 📡 Endpoints da API

Para referência técnica:

### 1. Enviar Dados do ESP32
```
URL: https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-data
Método: POST
Headers:
  - Content-Type: application/json
  - x-esp32-key: [SUA_API_KEY]

Body:
{
  "device_id": "string (UUID)",
  "temperature": number,
  "humidity": number,
  "water_level": number,
  "evaporation_rate": number (opcional)
}
```

### 2. Verificar Status do Sistema (Novo!)
```
URL: https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-control?device_id=[DEVICE_ID]
Método: GET
Headers:
  - x-esp32-key: [SUA_API_KEY]

Response:
{
  "success": true,
  "device_id": "string (UUID)",
  "device_name": "string",
  "status": "ligado" | "desligado",
  "message": "Device is ligado"
}
```

## 🎯 Funcionalidades Completas

- ✅ ESP32 conectado via WiFi
- ✅ **Controle remoto via app (ligar/desligar)**
- ✅ **ESP32 verifica status a cada 5 segundos**
- ✅ Dados sendo enviados automaticamente quando ligado
- ✅ Monitoramento em tempo real no app
- ✅ Histórico de leituras salvo no backend
- ✅ Controle de relé via status remoto
- ✅ Logs detalhados para debug
- 🔔 Configure alertas no app para valores críticos
- 📈 Analise gráficos de evolução dos dados
- ⚙️ Ajuste configurações de thresholds

## 📚 Recursos Adicionais

- [Documentação ESP32](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [Arduino IDE para ESP32](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/)
- [Sensor DHT11](https://learn.adafruit.com/dht)
- [LCD I2C](https://randomnerdtutorials.com/esp32-esp8266-i2c-lcd-arduino-ide/)

---

**Seu sistema está completo e funcional via WiFi com controle remoto! 🎉**

Agora você tem:
- ✅ Monitoramento remoto em tempo real
- ✅ Controle remoto do sistema pelo app
- ✅ Logs detalhados para depuração
- ✅ Feedback visual no LCD
- ✅ Capacidade de controlar equipamentos via relé
