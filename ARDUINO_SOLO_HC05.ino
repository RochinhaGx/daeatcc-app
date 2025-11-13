#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

// --- CONFIGURAÇÃO DOS PINOS ---
LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial bluetooth(10, 11); // RX=10, TX=11 para HC-05

const int sensorPin = A0;   // Sensor de umidade do solo
const int rele1Pin  = 7;    // IN1 do módulo relé
const int rele2Pin  = 8;    // IN2 do módulo relé

// --- VARIÁVEIS DE CONTROLE ---
int threshold = 600;        // Limite de umidade para acionar
bool sistemaLigado = false; // Controle remoto via app
bool modoAutomatico = true; // true = automático por sensor, false = manual via app
String deviceId = "dec6c9b8-1ad1-44a6-a798-2bcfd9147817";

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // Envia dados a cada 10 segundos

void setup() {
  lcd.init();
  lcd.backlight();
  
  pinMode(rele1Pin, OUTPUT);
  pinMode(rele2Pin, OUTPUT);
  digitalWrite(rele1Pin, HIGH); // Relés desligados (ativo em LOW)
  digitalWrite(rele2Pin, HIGH);
  
  Serial.begin(9600);       // Monitor Serial
  bluetooth.begin(9600);    // Comunicação Bluetooth HC-05
  
  Serial.println("========================================");
  Serial.println("🔵 Sistema DAEA - Controle de Umidade");
  Serial.println("========================================");
  Serial.println("📱 Aguardando conexão Bluetooth HC-05...");
  Serial.println("💡 Use o app para controlar remotamente");
  
  lcd.setCursor(0, 0);
  lcd.print("DAEA Sistema");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");
  
  delay(2000);
  lcd.clear();
  
  Serial.println("✅ Sistema pronto!");
  Serial.println("🔧 Modo: Automático (baseado em sensor)");
  Serial.println("========================================");
}

void loop() {
  // Verifica comandos do Bluetooth
  verificarComandosBluetooth();
  
  // Lê sensor de umidade do solo
  int valor = analogRead(sensorPin);
  int perc = map(valor, 1023, 0, 0, 100); // Converte para porcentagem
  perc = constrain(perc, 0, 100);
  
  // Log no Serial
  Serial.println("──────────────────────────────────────");
  Serial.print("🌱 Umidade Solo: ");
  Serial.print(perc);
  Serial.print("% (valor bruto: ");
  Serial.print(valor);
  Serial.println(")");
  Serial.print("⚙️  Modo: ");
  Serial.println(modoAutomatico ? "Automático" : "Manual (App)");
  Serial.print("⚡ Sistema: ");
  Serial.println(sistemaLigado ? "🟢 LIGADO" : "🔴 DESLIGADO");
  Serial.print("🔌 Relés: ");
  
  // Atualiza LCD - Linha 1
  lcd.setCursor(0, 0);
  lcd.print("Solo: ");
  lcd.print(perc);
  lcd.print("%   ");
  
  // Atualiza LCD - Linha 2
  lcd.setCursor(0, 1);
  
  // --- LÓGICA DE CONTROLE DOS RELÉS ---
  bool deveAtivarReles = false;
  
  if (modoAutomatico) {
    // MODO AUTOMÁTICO: Controla baseado no sensor
    lcd.print("Auto ");
    if (valor > threshold) {
      deveAtivarReles = true;
      Serial.println("LIGADOS (solo molhado)");
    } else {
      Serial.println("DESLIGADOS (solo seco)");
    }
  } else {
    // MODO MANUAL: Controla baseado no app
    lcd.print("App  ");
    deveAtivarReles = sistemaLigado;
    Serial.println(sistemaLigado ? "LIGADOS (via app)" : "DESLIGADOS (via app)");
  }
  
  // Atualiza estado dos relés
  if (deveAtivarReles) {
    digitalWrite(rele1Pin, LOW);   // Liga IN1 (ativo baixo)
    digitalWrite(rele2Pin, LOW);   // Liga IN2 (ativo baixo)
    lcd.setCursor(6, 1);
    lcd.print("U:");
    lcd.print(perc);
    lcd.print("% ON ");
  } else {
    digitalWrite(rele1Pin, HIGH);  // Desliga IN1
    digitalWrite(rele2Pin, HIGH);  // Desliga IN2
    lcd.setCursor(6, 1);
    lcd.print("U:");
    lcd.print(perc);
    lcd.print("% OFF");
  }
  
  Serial.println("──────────────────────────────────────");
  
  // Envia dados via Bluetooth periodicamente
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    enviarDadosBluetooth(valor, perc, deveAtivarReles);
  }
  
  delay(1000);
}

void verificarComandosBluetooth() {
  if (bluetooth.available() > 0) {
    String comando = bluetooth.readStringUntil('\n');
    comando.trim();
    
    Serial.print("📱 Comando Bluetooth: ");
    Serial.println(comando);
    
    if (comando == "LIGAR" || comando == "ON" || comando == "1") {
      modoAutomatico = false;
      sistemaLigado = true;
      Serial.println("✅ Sistema LIGADO via App (modo manual)");
      bluetooth.println("OK:LIGADO");
      
    } else if (comando == "DESLIGAR" || comando == "OFF" || comando == "0") {
      modoAutomatico = false;
      sistemaLigado = false;
      Serial.println("⚠️  Sistema DESLIGADO via App (modo manual)");
      bluetooth.println("OK:DESLIGADO");
      
    } else if (comando == "AUTO") {
      modoAutomatico = true;
      Serial.println("🔄 Modo Automático ativado (controle por sensor)");
      bluetooth.println("OK:AUTO");
      
    } else if (comando.startsWith("THRESHOLD:")) {
      int novoThreshold = comando.substring(10).toInt();
      if (novoThreshold > 0 && novoThreshold < 1024) {
        threshold = novoThreshold;
        Serial.print("⚙️  Threshold ajustado para: ");
        Serial.println(threshold);
        bluetooth.println("OK:THRESHOLD");
      } else {
        Serial.println("❌ Threshold inválido");
        bluetooth.println("ERROR:INVALID_THRESHOLD");
      }
      
    } else if (comando.startsWith("DEVICE_ID:")) {
      deviceId = comando.substring(10);
      Serial.print("📝 Device ID: ");
      Serial.println(deviceId);
      bluetooth.println("OK:ID_RECEBIDO");
      
    } else if (comando == "STATUS") {
      String status = modoAutomatico ? "AUTO" : (sistemaLigado ? "LIGADO" : "DESLIGADO");
      bluetooth.print("STATUS:");
      bluetooth.println(status);
      Serial.print("📊 Status enviado: ");
      Serial.println(status);
      
    } else {
      Serial.println("❌ Comando desconhecido");
      bluetooth.println("ERROR:UNKNOWN_COMMAND");
    }
  }
}

void enviarDadosBluetooth(int valorBruto, int porcentagem, bool relesAtivos) {
  Serial.println("📤 Enviando dados via Bluetooth...");
  
  // Formato: DADOS|umidade_solo_perc|valor_bruto|reles_status|modo
  String dados = "DADOS|";
  dados += String(porcentagem) + "|";
  dados += String(valorBruto) + "|";
  dados += relesAtivos ? "ON" : "OFF";
  dados += "|";
  dados += modoAutomatico ? "AUTO" : "MANUAL";
  
  bluetooth.println(dados);
  
  Serial.print("✅ Enviado: ");
  Serial.println(dados);
  
  // Indicador visual no LCD
  lcd.setCursor(15, 0);
  lcd.print("*");
  delay(100);
  lcd.setCursor(15, 0);
  lcd.print(" ");
}
