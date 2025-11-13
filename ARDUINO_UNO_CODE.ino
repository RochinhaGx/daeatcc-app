#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>
#include "DHT.h"

// --- CONFIGURAÇÕES DOS PINOS ---
#define DHTPIN 4          // Pino de dados do DHT22
#define DHTTYPE DHT22     // Tipo do sensor DHT22
#define SOIL_PIN A0       // Pino analógico do sensor de umidade do solo
#define RELAY_PIN 2       // Pino do relé para controle do sistema
#define BT_RX 10          // Pino RX do HC-05 conectado ao TX do Arduino
#define BT_TX 11          // Pino TX do HC-05 conectado ao RX do Arduino

// --- OBJETOS ---
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial bluetooth(BT_RX, BT_TX); // RX, TX

// --- VARIÁVEIS ---
float temperatura;
float umidade_ar;
int umidade_solo;
int umidade_solo_percentual;
float nivel_agua_cm;
float taxa_evaporacao;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // Envia a cada 10 segundos
bool sistemaLigado = false;
String deviceId = "dec6c9b8-1ad1-44a6-a798-2bcfd9147817"; // ID do dispositivo

void setup() {
  Serial.begin(9600);      // Monitor Serial
  bluetooth.begin(9600);   // Comunicação Bluetooth HC-05
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Sistema desligado inicialmente

  // Mensagens de inicialização
  Serial.println("========================================");
  Serial.println("🔵 Sistema DAEA Iniciando...");
  Serial.println("========================================");
  
  lcd.setCursor(0, 0);
  lcd.print("DAEA Sistema");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");
  
  Serial.println("📱 Aguardando conexão Bluetooth...");
  Serial.println("💡 Use o app para conectar via HC-05");
  
  delay(2000);
  lcd.clear();
  
  Serial.println("✅ Sistema pronto!");
  Serial.println("========================================");
}

void loop() {
  // Verifica comandos do Bluetooth
  verificarComandosBluetooth();
  
  // --- LEITURA DOS SENSORES ---
  umidade_ar = dht.readHumidity();
  temperatura = dht.readTemperature();
  umidade_solo = analogRead(SOIL_PIN);

  // Verifica se as leituras são válidas
  if (isnan(umidade_ar) || isnan(temperatura)) {
    Serial.println("❌ Erro ao ler do DHT22!");
    lcd.setCursor(0, 0);
    lcd.print("Erro DHT22!     ");
    delay(2000);
    return;
  }

  // --- CONVERSÃO DA UMIDADE DO SOLO ---
  // Arduino Uno tem ADC de 10 bits (0-1023)
  umidade_solo_percentual = map(umidade_solo, 1023, 0, 0, 100);
  umidade_solo_percentual = constrain(umidade_solo_percentual, 0, 100);

  // --- NÍVEL DE ÁGUA (Simulação baseada na umidade do solo) ---
  // Converte umidade do solo em nível de água em cm (30-80cm)
  nivel_agua_cm = map(umidade_solo_percentual, 0, 100, 30, 80);
  nivel_agua_cm = nivel_agua_cm + (random(-10, 10) / 10.0); // Adiciona variação
  nivel_agua_cm = constrain(nivel_agua_cm, 30, 80);

  // --- CÁLCULO DA TAXA DE EVAPORAÇÃO ---
  // Quanto maior a temperatura e menor a umidade, maior a evaporação
  float tempFactor = (temperatura - 20.0) / 10.0; // Normalizado
  float humidityFactor = (100.0 - umidade_ar) / 100.0; // Invertido e normalizado
  taxa_evaporacao = (tempFactor * 2.0 + humidityFactor * 3.0);
  taxa_evaporacao = constrain(taxa_evaporacao, 0, 10); // Limita entre 0-10 mm/h

  // --- EXIBE NO MONITOR SERIAL ---
  Serial.println("──────────────────────────────────────");
  Serial.print("🌡️  Temperatura: ");
  Serial.print(temperatura, 1);
  Serial.println(" °C");
  
  Serial.print("💧 Umidade Ar: ");
  Serial.print(umidade_ar, 1);
  Serial.println(" %");
  
  Serial.print("🌱 Umidade Solo: ");
  Serial.print(umidade_solo_percentual);
  Serial.println(" %");
  
  Serial.print("📏 Nível Água: ");
  Serial.print(nivel_agua_cm, 1);
  Serial.println(" cm");
  
  Serial.print("💨 Taxa Evaporação: ");
  Serial.print(taxa_evaporacao, 2);
  Serial.println(" mm/h");
  
  Serial.print("⚡ Sistema: ");
  Serial.println(sistemaLigado ? "🟢 LIGADO" : "🔴 DESLIGADO");
  Serial.println("──────────────────────────────────────");

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
  lcd.print(umidade_solo_percentual);
  lcd.print("% ");
  
  // Indicador de status
  lcd.setCursor(12, 1);
  if (sistemaLigado) {
    lcd.print("ON ");
  } else {
    lcd.print("OFF");
  }

  // --- CONTROLA RELÉ ---
  digitalWrite(RELAY_PIN, sistemaLigado ? HIGH : LOW);

  // --- ENVIA DADOS VIA BLUETOOTH ---
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= sendInterval && sistemaLigado) {
    lastSendTime = currentTime;
    enviarDadosBluetooth();
  }

  delay(2000);
}

void verificarComandosBluetooth() {
  if (bluetooth.available() > 0) {
    String comando = bluetooth.readStringUntil('\n');
    comando.trim();
    
    Serial.print("📱 Comando recebido: ");
    Serial.println(comando);
    
    if (comando == "LIGAR" || comando == "ON" || comando == "1") {
      sistemaLigado = true;
      Serial.println("✅ Sistema LIGADO via Bluetooth");
      bluetooth.println("OK:LIGADO");
      
    } else if (comando == "DESLIGAR" || comando == "OFF" || comando == "0") {
      sistemaLigado = false;
      Serial.println("⚠️ Sistema DESLIGADO via Bluetooth");
      bluetooth.println("OK:DESLIGADO");
      
    } else if (comando.startsWith("DEVICE_ID:")) {
      deviceId = comando.substring(10);
      Serial.print("📝 Device ID configurado: ");
      Serial.println(deviceId);
      bluetooth.println("OK:ID_RECEBIDO");
      
    } else if (comando == "STATUS") {
      String status = sistemaLigado ? "LIGADO" : "DESLIGADO";
      bluetooth.println("STATUS:" + status);
      Serial.print("📊 Status enviado: ");
      Serial.println(status);
      
    } else {
      Serial.println("❌ Comando desconhecido");
      bluetooth.println("ERROR:UNKNOWN_COMMAND");
    }
  }
}

void enviarDadosBluetooth() {
  Serial.println("📤 Enviando dados via Bluetooth...");
  
  // Formato: DADOS|temp|humid|solo|agua|evap
  String dados = "DADOS|";
  dados += String(temperatura, 2) + "|";
  dados += String(umidade_ar, 2) + "|";
  dados += String(umidade_solo_percentual) + "|";
  dados += String(nivel_agua_cm, 2) + "|";
  dados += String(taxa_evaporacao, 2);
  
  bluetooth.println(dados);
  
  Serial.print("✅ Enviado: ");
  Serial.println(dados);
  
  lcd.setCursor(15, 0);
  lcd.print("*");
  delay(100);
  lcd.setCursor(15, 0);
  lcd.print(" ");
}
