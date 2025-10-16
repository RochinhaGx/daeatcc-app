#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// --- CONFIGURAÇÕES DOS PINOS ---
#define DHTPIN 4          // Pino de dados do DHT11
#define DHTTYPE DHT11     // Tipo do sensor DHT
#define SOIL_PIN 34       // Pino analógico do sensor de umidade do solo

// --- CONFIGURAÇÕES WIFI ---
const char* ssid = "SEU_WIFI_AQUI";           // Nome da sua rede WiFi
const char* password = "SUA_SENHA_AQUI";      // Senha da sua rede WiFi

// --- CONFIGURAÇÕES DO SERVIDOR ---
const char* serverUrl = "https://lhqqbadcqspvhtvfomdp.supabase.co/functions/v1/esp32-data";
const char* apiKey = "SUA_API_KEY_AQUI";      // Você vai obter isso no app
const char* deviceId = "SEU_DEVICE_ID_AQUI";  // ID do dispositivo (você cria no app)

// --- OBJETOS ---
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- VARIÁVEIS ---
float temperatura;
float umidade_ar;
int umidade_solo;
int umidade_percentual;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // Envia a cada 10 segundos

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();

  // Conecta ao WiFi
  lcd.setCursor(0, 0);
  lcd.print("Conectando WiFi");
  Serial.println("Conectando ao WiFi...");
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(0, 1);
    lcd.print("Tentando... ");
    lcd.print(attempts);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi OK!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    delay(3000);
  } else {
    Serial.println("\nFalha ao conectar WiFi");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi ERRO!");
    lcd.setCursor(0, 1);
    lcd.print("Verifique config");
  }
  
  lcd.clear();
}

void loop() {
  // --- LEITURA DOS SENSORES ---
  umidade_ar = dht.readHumidity();
  temperatura = dht.readTemperature();
  umidade_solo = analogRead(SOIL_PIN);

  // Verifica se as leituras são válidas
  if (isnan(umidade_ar) || isnan(temperatura)) {
    Serial.println("Erro ao ler do DHT!");
    return;
  }

  // --- CONVERSÃO DA UMIDADE DO SOLO ---
  umidade_percentual = map(umidade_solo, 4095, 0, 0, 100);
  umidade_percentual = constrain(umidade_percentual, 0, 100);

  // --- EXIBE NO MONITOR SERIAL ---
  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.print(" °C | Umidade ar: ");
  Serial.print(umidade_ar);
  Serial.print(" % | Solo: ");
  Serial.print(umidade_percentual);
  Serial.println(" %");

  // --- EXIBE NO LCD ---
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temperatura, 1);
  lcd.print("C ");
  lcd.print("U:");
  lcd.print(umidade_ar, 0);
  lcd.print("% ");

  lcd.setCursor(0, 1);
  lcd.print("Solo:");
  lcd.print(umidade_percentual);
  lcd.print("%   ");

  // --- ENVIA DADOS PARA O SERVIDOR ---
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    
    if (WiFi.status() == WL_CONNECTED) {
      enviarDados();
    } else {
      Serial.println("WiFi desconectado. Reconectando...");
      WiFi.reconnect();
    }
  }

  delay(2000);
}

void enviarDados() {
  HTTPClient http;
  
  Serial.println("Enviando dados para o servidor...");
  
  // Configurar requisição HTTP
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-esp32-key", apiKey);
  
  // Criar JSON com os dados
  String jsonData = "{";
  jsonData += "\"device_id\":\"" + String(deviceId) + "\",";
  jsonData += "\"temperature\":" + String(temperatura, 2) + ",";
  jsonData += "\"humidity\":" + String(umidade_ar, 2) + ",";
  jsonData += "\"water_level\":" + String(umidade_percentual, 2);
  jsonData += "}";
  
  Serial.println("JSON: " + jsonData);
  
  // Enviar requisição POST
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Código de resposta: ");
    Serial.println(httpResponseCode);
    Serial.print("Resposta: ");
    Serial.println(response);
    
    // Mostra status no LCD
    lcd.setCursor(12, 1);
    if (httpResponseCode == 200) {
      lcd.print("OK  ");
    } else {
      lcd.print("ERR ");
    }
  } else {
    Serial.print("Erro ao enviar: ");
    Serial.println(httpResponseCode);
    lcd.setCursor(12, 1);
    lcd.print("FAIL");
  }
  
  http.end();
}
