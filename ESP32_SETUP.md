# Como Conectar o ESP32 ao Sistema DAEA

## 📋 O que você precisa

1. **ESP32** com WiFi
2. **Sensores conectados:**
   - Sensor de temperatura (ex: DHT22)
   - Sensor de umidade (integrado no DHT22)
   - Sensor de nível de água (ultrassônico ou capacitivo)
3. **Arduino IDE** instalado
4. **Bibliotecas necessárias:**
   - WiFi.h (já vem com ESP32)
   - HTTPClient.h (já vem com ESP32)
   - ArduinoJson.h (instalar via Library Manager)

## 🔑 Configuração das Credenciais

1. **API Key do ESP32:** Use a chave que você configurou no secret `ESP32_API_KEY`
2. **Device ID:** Copie o ID do dispositivo do painel (na aba "Home" ou "Dashboard")
3. **WiFi:** Nome da sua rede e senha

## 📡 Endpoint da API

```
URL: https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-data
Método: POST
Header: x-esp32-key: [SUA_API_KEY]
```

## 💻 Código para o ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== CONFIGURAÇÕES - ALTERE AQUI =====
const char* ssid = "SEU_WIFI";              // Nome da sua rede WiFi
const char* password = "SUA_SENHA_WIFI";    // Senha da sua rede WiFi
const char* apiKey = "SUA_API_KEY_AQUI";    // API Key do ESP32
const char* deviceId = "SEU_DEVICE_ID";     // ID do dispositivo do DAEA
const char* apiUrl = "https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-data";

// ===== CONFIGURAÇÕES DOS SENSORES =====
#define DHT_PIN 4          // Pino do sensor DHT22
#define WATER_LEVEL_PIN 34 // Pino do sensor de nível de água (analógico)

// Intervalo de envio (em milissegundos)
const unsigned long SEND_INTERVAL = 30000; // 30 segundos
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Conectar ao WiFi
  Serial.println();
  Serial.print("Conectando ao WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
  
  // Inicializar sensores
  pinMode(WATER_LEVEL_PIN, INPUT);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Enviar dados a cada SEND_INTERVAL
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;
    
    if (WiFi.status() == WL_CONNECTED) {
      // Ler sensores
      float temperature = readTemperature();
      float humidity = readHumidity();
      float waterLevel = readWaterLevel();
      float evaporationRate = calculateEvaporationRate(temperature, humidity);
      
      // Enviar dados
      sendSensorData(temperature, humidity, waterLevel, evaporationRate);
    } else {
      Serial.println("WiFi desconectado. Tentando reconectar...");
      WiFi.reconnect();
    }
  }
}

// Função para ler temperatura (exemplo com DHT22)
float readTemperature() {
  // SUBSTITUA pela leitura real do seu sensor DHT22
  // Exemplo usando biblioteca DHT:
  // return dht.readTemperature();
  
  // Simulação para teste:
  return 25.0 + random(-5, 5);
}

// Função para ler umidade (exemplo com DHT22)
float readHumidity() {
  // SUBSTITUA pela leitura real do seu sensor DHT22
  // Exemplo usando biblioteca DHT:
  // return dht.readHumidity();
  
  // Simulação para teste:
  return 60.0 + random(-10, 10);
}

// Função para ler nível de água
float readWaterLevel() {
  // Ler valor analógico (0-4095 no ESP32)
  int rawValue = analogRead(WATER_LEVEL_PIN);
  
  // Converter para porcentagem (0-100%)
  float waterLevel = map(rawValue, 0, 4095, 0, 100);
  
  return waterLevel;
}

// Função para calcular taxa de evaporação
float calculateEvaporationRate(float temp, float humidity) {
  // Fórmula simplificada de evaporação
  // Taxa aumenta com temperatura e diminui com umidade
  float rate = (temp / 10.0) * (1.0 - (humidity / 100.0));
  return rate * 3.0; // Multiplicador para deixar em escala adequada
}

// Função para enviar dados para a API
void sendSensorData(float temp, float humidity, float waterLevel, float evapRate) {
  HTTPClient http;
  
  Serial.println("\n=== Enviando dados ===");
  Serial.printf("Temperatura: %.2f°C\n", temp);
  Serial.printf("Umidade: %.2f%%\n", humidity);
  Serial.printf("Nível de água: %.2f%%\n", waterLevel);
  Serial.printf("Taxa de evaporação: %.2f\n", evapRate);
  
  // Configurar requisição HTTP
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-esp32-key", apiKey);
  
  // Criar JSON com os dados
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["temperature"] = temp;
  doc["humidity"] = humidity;
  doc["water_level"] = waterLevel;
  doc["evaporation_rate"] = evapRate;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  Serial.println("JSON enviado:");
  Serial.println(jsonData);
  
  // Enviar requisição POST
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Resposta HTTP: ");
    Serial.println(httpResponseCode);
    Serial.println("Resposta do servidor:");
    Serial.println(response);
    
    if (httpResponseCode == 200) {
      Serial.println("✓ Dados enviados com sucesso!");
    } else {
      Serial.println("✗ Erro ao enviar dados");
    }
  } else {
    Serial.print("✗ Erro na requisição HTTP: ");
    Serial.println(httpResponseCode);
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}
```

## 🔧 Instalação das Bibliotecas

### ArduinoJson
1. Abra o Arduino IDE
2. Vá em **Sketch → Include Library → Manage Libraries**
3. Procure por "ArduinoJson"
4. Instale a versão 6.x (recomendado)

### DHT Sensor Library (se usar DHT22)
1. No Library Manager, procure por "DHT sensor library"
2. Instale a biblioteca "DHT sensor library" by Adafruit
3. Também instale "Adafruit Unified Sensor" que é requerido

## 📝 Passos para Usar

1. **Copie o código** acima para o Arduino IDE
2. **Instale as bibliotecas** necessárias
3. **Configure as credenciais:**
   - WiFi (SSID e senha)
   - API Key do ESP32
   - Device ID do seu dispositivo DAEA
4. **Ajuste os pinos** dos sensores conforme seu hardware
5. **Faça upload** para o ESP32
6. **Abra o Serial Monitor** (115200 baud) para ver os logs
7. **Verifique no site** se os dados estão chegando

## 🔍 Verificação

### No Serial Monitor do ESP32:
```
Conectando ao WiFi...
WiFi conectado!
Endereço IP: 192.168.1.100

=== Enviando dados ===
Temperatura: 26.50°C
Umidade: 65.30%
Nível de água: 78.20%
Taxa de evaporação: 2.85
JSON enviado:
{"device_id":"abc123...","temperature":26.5,"humidity":65.3,...}
Resposta HTTP: 200
✓ Dados enviados com sucesso!
```

### No Site DAEA:
1. Vá para a aba **Dashboard** ou **Histórico**
2. Os dados devem aparecer automaticamente
3. O status do dispositivo deve mudar para "ligado"

## ⚠️ Troubleshooting

### WiFi não conecta
- Verifique SSID e senha
- Certifique-se que o WiFi é 2.4GHz (ESP32 não funciona em 5GHz)
- Aproxime o ESP32 do roteador

### Erro 401 (Unauthorized)
- Verifique se a API Key está correta
- Confirme que o secret `ESP32_API_KEY` foi configurado

### Erro 404 (Device not found)
- Verifique se o `device_id` está correto
- Crie um dispositivo no painel DAEA primeiro

### Dados não aparecem no site
- Verifique a resposta HTTP no Serial Monitor
- Confirme que está logado com o usuário correto
- Recarregue a página do site

## 🎯 Próximos Passos

- Adicione mais sensores conforme necessário
- Ajuste o intervalo de envio (variável `SEND_INTERVAL`)
- Implemente reconexão automática ao WiFi
- Adicione modo deep sleep para economizar bateria
- Configure alertas no sistema DAEA

## 📚 Recursos Adicionais

- [Documentação ESP32](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [Biblioteca ArduinoJson](https://arduinojson.org/)
- [Sensor DHT22](https://learn.adafruit.com/dht)
