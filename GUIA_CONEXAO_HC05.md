# 📱 Guia de Conexão HC-05 com o App DAEA

## 🔧 Conexões do HC-05

### ⚠️ IMPORTANTE: Divisor de Tensão
O HC-05 funciona em **3.3V** na comunicação serial, mas o Arduino Uno envia **5V**. Você DEVE usar um divisor de tensão!

```
Arduino TX (D11) ---[ R1: 1kΩ ]--- HC-05 RX
                           |
                    [ R2: 2kΩ ]
                           |
                         GND
```

### Conexões Completas:
```
HC-05 VCC → Arduino 5V
HC-05 GND → Arduino GND
HC-05 TX  → Arduino D10 (RX no código)
HC-05 RX  → Divisor de tensão → Arduino D11 (TX no código)
```

## 🚀 Como Conectar ao App

### 1️⃣ Prepare o Arduino
1. Carregue o código `ARDUINO_SOLO_HC05.ino`
2. Verifique as conexões do HC-05
3. Ligue o Arduino
4. O LED do HC-05 deve piscar rapidamente (não emparelhado)

### 2️⃣ Abra o App no Navegador
- Use **Chrome**, **Edge** ou **Opera** (suportam Web Bluetooth)
- Acesse o app DAEA
- Vá para a aba **"Configurações"**

### 3️⃣ Conecte via Bluetooth
1. Clique no botão **"Conectar Arduino"**
2. Na janela que abrir, clique **"Conectar via Bluetooth"**
3. Uma lista de dispositivos Bluetooth aparecerá
4. Selecione **"HC-05"**, **"DAEA-Arduino"** ou **"linvor"**
5. Aguarde a conexão
6. Você verá uma mensagem de sucesso! ✅

### 4️⃣ Controle o Sistema
Após conectado, vá para a aba **"Sensores"**:
- Use o **botão de power** grande para ligar/desligar o sistema
- Quando LIGADO: o sistema funciona via app (modo manual)
- Quando DESLIGADO: o sistema volta ao modo automático

## 📊 Como Funcionam os Modos

### 🔄 Modo Automático (Padrão)
- Sistema controla os relés baseado no sensor de umidade
- Solo MOLHADO (> threshold) → Relés LIGAM
- Solo SECO (< threshold) → Relés DESLIGAM
- LCD mostra: `Auto U:XX% ON/OFF`

### 📱 Modo Manual (Via App)
- Você controla quando liga/desliga via app
- Sensor continua lendo, mas não controla os relés
- LCD mostra: `App  U:XX% ON/OFF`

## 🎮 Comandos Disponíveis

Você pode enviar estes comandos via Bluetooth:

```
LIGAR ou ON ou 1     → Liga sistema (modo manual)
DESLIGAR ou OFF ou 0 → Desliga sistema (modo manual)
AUTO                 → Volta ao modo automático
STATUS               → Retorna status atual
THRESHOLD:600        → Ajusta limite de umidade (0-1023)
DEVICE_ID:xxx        → Configura ID do dispositivo
```

## 📺 Monitor Serial

Acompanhe tudo pelo Monitor Serial (9600 baud):

```
🌱 Umidade Solo: 45% (valor bruto: 620)
⚙️  Modo: Automático
⚡ Sistema: 🟢 LIGADO
🔌 Relés: LIGADOS (solo molhado)
```

## 📱 Dados Enviados ao App

A cada 10 segundos, o Arduino envia:
```
DADOS|45|620|ON|AUTO
      │  │  │  └─ Modo (AUTO/MANUAL)
      │  │  └─── Status dos relés (ON/OFF)
      │  └────── Valor bruto do sensor
      └───────── Umidade em porcentagem
```

## 🔍 Troubleshooting

### HC-05 não aparece na lista
- ✅ LED do HC-05 está piscando?
- ✅ VCC em 5V e GND conectado?
- ✅ Divisor de tensão instalado?
- ✅ Tente resetar o Arduino
- ✅ Teste emparelhamento no celular primeiro (PIN: 1234)

### Conectou mas não controla
- ✅ Código carregado corretamente?
- ✅ Monitor Serial mostra comandos recebidos?
- ✅ Relés respondendo manualmente?
- ✅ Tente enviar comando "STATUS" para testar

### LCD não mostra nada
- ✅ Endereço I2C correto? (0x27 ou 0x3F)
- ✅ Ajuste contraste do LCD
- ✅ Verifique conexões SDA/SCL

### Sensor de umidade sempre 0 ou 100%
- ✅ Sensor conectado em A0?
- ✅ Calibre o threshold (comando THRESHOLD:XXX)
- ✅ Teste em solo seco e molhado
- ✅ Valores típicos: seco=200-400, molhado=600-900

## 🎯 Fluxo de Uso Típico

1. **Inicialização**
   - Liga Arduino
   - Sistema em modo automático
   - Relés controlados pelo sensor

2. **Conexão do App**
   - Abre app no Chrome/Edge/Opera
   - Conecta via Bluetooth
   - Vê dados em tempo real

3. **Controle Manual**
   - Liga sistema via app
   - Relés ativam independente do sensor
   - Você tem controle total

4. **Volta ao Automático**
   - Desliga via app OU
   - Envia comando "AUTO" OU
   - Reseta o Arduino

## 📈 Ajustando o Threshold

O threshold define quando o solo é "molhado":
- **Padrão: 600** (funciona para maioria dos sensores)
- **Solo Seco**: 200-400
- **Solo Molhado**: 600-900

Para ajustar via Bluetooth:
```
THRESHOLD:700  (ajusta para 700)
```

Ou edite direto no código:
```cpp
int threshold = 600;  // Mude este valor
```

## ⚡ Diagrama de Conexão Completo

```
┌─────────────────┐
│  Arduino Uno    │
│                 │
│  5V ────────────┼─── HC-05 VCC
│  GND ───────────┼─── HC-05 GND
│  D10 (RX) ──────┼─── HC-05 TX (direto)
│  D11 (TX) ──────┼─── [Divisor] ─── HC-05 RX
│                 │
│  A0 ────────────┼─── Sensor Umidade
│  D7 ────────────┼─── Relé 1 (IN1)
│  D8 ────────────┼─── Relé 2 (IN2)
│  A4 (SDA) ──────┼─── LCD SDA
│  A5 (SCL) ──────┼─── LCD SCL
└─────────────────┘
```

## 🎓 Dicas Avançadas

### Configurar Nome do HC-05
```
1. Entre no modo AT (segure botão ao ligar)
2. Conecte ao Serial Monitor (9600 baud)
3. Envie: AT+NAME=DAEA-Arduino
4. Envie: AT+PSWD=1234
```

### Testar Comunicação
No Monitor Serial, envie via Software Serial:
```
bluetooth.println("TESTE");
```

### Debug de Comandos
Todos comandos recebidos aparecem no Serial:
```
📱 Comando Bluetooth: LIGAR
✅ Sistema LIGADO via App (modo manual)
```

---

**Desenvolvido para Sistema DAEA** 🌊
*Controle Inteligente de Umidade do Solo*
