#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// --- CONFIGURAÇÕES DOS PINOS ---
#define DHTPIN 4          // Pino de dados do DHT11
#define DHTTYPE DHT11     // Tipo do sensor DHT
#define SOIL_PIN 34       // Pino analógico do sensor de umidade do solo
#define RELAY_PIN 2       // Pino para controle do relé (opcional)

// --- CONFIGURAÇÕES WIFI ---
const char* ssid = "COLOQUE_SEU_WIFI_AQUI";           // ⚠️ ALTERE PARA SEU WIFI
const char* password = "COLOQUE_SUA_SENHA_AQUI";      // ⚠️ ALTERE PARA SUA SENHA

// --- CONFIGURAÇÕES DO SERVIDOR ---
const char* serverUrl = "https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-data";
const char* controlUrl = "https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-control";
const char* apiKey = "COLOQUE_SUA_API_KEY_AQUI";      // ⚠️ OBTENHA NO APP EM CONFIGURAÇÕES
const char* deviceId = "dec6c9b8-1ad1-44a6-a798-2bcfd9147817";  // ⚠️ COPIE DO APP EM CONFIGURAÇÕES

// --- OBJETOS ---
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- VARIÁVEIS ---
float temperatura;
float umidade_ar;
int umidade_solo;
int umidade_percentual;
unsigned long lastSendTime = 0;
unsigned long lastCheckTime = 0;
const unsigned long sendInterval = 10000;     // Envia dados a cada 10 segundos
const unsigned long checkInterval = 5000;     // Verifica status a cada 5 segundos
bool sistemaLigado = false;                   // Controle do sistema

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== DAEA ESP32 Sistema Iniciando ===");
  Serial.print("Device ID: ");
  Serial.println(deviceId);
  
  // Configura pino do relé (se usar)
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  dht.begin();
  Serial.println("✓ Sensor DHT11 inicializado");
  
  lcd.init();
  lcd.backlight();
  Serial.println("✓ LCD inicializado");

  // Conecta ao WiFi
  lcd.setCursor(0, 0);
  lcd.print("Conectando WiFi");
  Serial.println("\n--- Conectando ao WiFi ---");
  Serial.print("SSID: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(0, 1);
    lcd.print("Tentando... ");
    lcd.print(attempts);
    attempts++;
  }
  
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✓ WiFi conectado com sucesso!");
    Serial.print("✓ Endereço IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("✓ Força do sinal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Conectado!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    delay(2000);
    
    // Verifica status inicial do sistema
    Serial.println("\n--- Verificando status inicial ---");
    verificarStatusSistema();
  } else {
    Serial.println("✗ ERRO: Falha ao conectar WiFi!");
    Serial.println("✗ Verifique SSID e senha!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi ERRO!");
    lcd.setCursor(0, 1);
    lcd.print("Check config");
  }
  
  lcd.clear();
  Serial.println("\n=== Sistema pronto! ===\n");
}

void loop() {
  unsigned long currentTime = millis();
  
  // --- VERIFICA STATUS DO SISTEMA NO SERVIDOR ---
  if (currentTime - lastCheckTime >= checkInterval) {
    lastCheckTime = currentTime;
    if (WiFi.status() == WL_CONNECTED) {
      verificarStatusSistema();
    }
  }
  
  // --- LEITURA DOS SENSORES ---
  umidade_ar = dht.readHumidity();
  temperatura = dht.readTemperature();
  umidade_solo = analogRead(SOIL_PIN);

  // Verifica se as leituras são válidas
  if (isnan(umidade_ar) || isnan(temperatura)) {
    Serial.println("✗ ERRO: Falha ao ler sensor DHT11!");
    lcd.setCursor(0, 0);
    lcd.print("ERRO SENSOR DHT!");
    delay(2000);
    return;
  }

  // --- CONVERSÃO DA UMIDADE DO SOLO ---
  umidade_percentual = map(umidade_solo, 4095, 0, 0, 100);
  umidade_percentual = constrain(umidade_percentual, 0, 100);

  // --- EXIBE NO MONITOR SERIAL ---
  Serial.print("📊 T: ");
  Serial.print(temperatura, 1);
  Serial.print("°C | U: ");
  Serial.print(umidade_ar, 1);
  Serial.print("% | Solo: ");
  Serial.print(umidade_percentual);
  Serial.print("% | Sistema: ");
  Serial.println(sistemaLigado ? "LIGADO" : "DESLIGADO");

  // --- EXIBE NO LCD ---
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temperatura, 1);
  lcd.print("C U:");
  lcd.print(umidade_ar, 0);
  lcd.print("%");
  
  if (sistemaLigado) {
    lcd.print(" ON ");
  } else {
    lcd.print(" OFF");
  }

  lcd.setCursor(0, 1);
  lcd.print("Solo:");
  lcd.print(umidade_percentual);
  lcd.print("%");

  // --- CONTROLA RELÉ BASEADO NO STATUS ---
  digitalWrite(RELAY_PIN, sistemaLigado ? HIGH : LOW);

  // --- ENVIA DADOS PARA O SERVIDOR (APENAS SE LIGADO) ---
  if (sistemaLigado && (currentTime - lastSendTime >= sendInterval)) {
    lastSendTime = currentTime;
    
    if (WiFi.status() == WL_CONNECTED) {
      enviarDados();
    } else {
      Serial.println("✗ WiFi desconectado. Tentando reconectar...");
      WiFi.reconnect();
      lcd.setCursor(12, 1);
      lcd.print("WIFI");
    }
  }

  delay(2000);
}

void verificarStatusSistema() {
  HTTPClient http;
  
  Serial.println("\n🔍 Verificando status do sistema...");
  
  // Configurar requisição HTTP
  String url = String(controlUrl) + "?device_id=" + String(deviceId);
  http.begin(url);
  http.addHeader("x-esp32-key", apiKey);
  
  // Enviar requisição GET
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.print("✓ Resposta do servidor: ");
    Serial.println(response);
    
    // Parse simples do JSON (procura por "ligado" ou "desligado")
    if (response.indexOf("\"status\":\"ligado\"") > 0) {
      if (!sistemaLigado) {
        Serial.println("✓ Sistema LIGADO remotamente!");
        sistemaLigado = true;
      }
    } else if (response.indexOf("\"status\":\"desligado\"") > 0) {
      if (sistemaLigado) {
        Serial.println("✓ Sistema DESLIGADO remotamente!");
        sistemaLigado = false;
      }
    }
  } else {
    Serial.print("✗ Erro ao verificar status. Código: ");
    Serial.println(httpResponseCode);
    if (httpResponseCode == 401) {
      Serial.println("✗ API Key inválida! Verifique a chave no código.");
    } else if (httpResponseCode == 404) {
      Serial.println("✗ Device ID não encontrado! Verifique o ID no código.");
    }
  }
  
  http.end();
}

void enviarDados() {
  HTTPClient http;
  
  Serial.println("\n📤 Enviando dados para o servidor...");
  Serial.println("---");
  Serial.print("🌡️  Temperatura: ");
  Serial.print(temperatura, 2);
  Serial.println("°C");
  Serial.print("💧 Umidade: ");
  Serial.print(umidade_ar, 2);
  Serial.println("%");
  Serial.print("🌊 Nível água: ");
  Serial.print(umidade_percentual, 2);
  Serial.println("%");
  Serial.println("---");
  
  // Configurar requisição HTTP
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-esp32-key", apiKey);
  http.setTimeout(10000); // Timeout de 10 segundos
  
  // Criar JSON com os dados
  String jsonData = "{";
  jsonData += "\"device_id\":\"" + String(deviceId) + "\",";
  jsonData += "\"temperature\":" + String(temperatura, 2) + ",";
  jsonData += "\"humidity\":" + String(umidade_ar, 2) + ",";
  jsonData += "\"water_level\":" + String(umidade_percentual, 2);
  jsonData += "}";
  
  Serial.print("📦 Payload: ");
  Serial.println(jsonData);
  
  // Enviar requisição POST
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✓ Código HTTP: ");
    Serial.println(httpResponseCode);
    Serial.print("✓ Resposta: ");
    Serial.println(response);
    
    // Mostra status no LCD
    lcd.setCursor(11, 1);
    if (httpResponseCode == 200) {
      lcd.print(" OK  ");
      Serial.println("✓ Dados enviados com sucesso!");
    } else {
      lcd.print(" ERR ");
      Serial.println("✗ Erro no servidor!");
    }
  } else {
    Serial.print("✗ Erro na requisição. Código: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == -1) {
      Serial.println("✗ Timeout - Servidor não respondeu!");
    } else if (httpResponseCode == -11) {
      Serial.println("✗ Erro de conexão SSL/TLS!");
    }
    
    lcd.setCursor(11, 1);
    lcd.print(" FAIL");
  }
  
  http.end();
  Serial.println();
}
