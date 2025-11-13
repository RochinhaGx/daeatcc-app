# Sistema DAEA - Monitoramento de Evaporação de Água 🌊

Sistema completo de monitoramento e controle de umidade do solo com Arduino Uno, HC-05 e app web.

## 🚀 Recursos

- 📱 **App Web Responsivo** - Interface moderna e intuitiva
- 🔵 **Conexão Bluetooth** - Conecte com Arduino via HC-05
- 🌡️ **Monitoramento em Tempo Real** - Sensor de umidade do solo
- ⚡ **Controle Remoto** - Liga/desliga relés via app
- 🔄 **Modo Automático** - Sistema inteligente baseado em threshold
- 📊 **Histórico de Dados** - Gráficos e análises
- 🎨 **Design Responsivo** - Otimizado para iPad e mobile

## 🔧 Hardware Necessário

- Arduino Uno
- Módulo Bluetooth HC-05
- Sensor de umidade do solo (analógico)
- Display LCD 16x2 I2C
- Módulo relé 2 canais (5V)
- Resistores para divisor de tensão (1kΩ e 2kΩ)
- Jumpers e protoboard

## 📱 Como Usar

### 1️⃣ Configure o Arduino
```bash
# Abra o Arduino IDE
# Carregue o arquivo: ARDUINO_SOLO_HC05.ino
# Faça upload para o Arduino Uno
```

### 2️⃣ Conecte o Hardware
Consulte o arquivo **GUIA_CONEXAO_HC05.md** para:
- Diagrama de conexões completo
- Configuração do divisor de tensão (IMPORTANTE!)
- Pinagem detalhada

### 3️⃣ Acesse o App
1. Abra o app no **Chrome**, **Edge** ou **Opera**
2. Faça login ou crie uma conta
3. Vá para a aba **"Configurações"**
4. Clique em **"Conectar Arduino"**
5. Selecione o dispositivo **HC-05** na lista

### 4️⃣ Controle o Sistema
- 🟢 **Ligar**: Clique no botão power (modo manual via app)
- 🔴 **Desligar**: Clique novamente (volta ao modo automático)
- 📊 **Monitorar**: Veja dados em tempo real na aba "Sensores"
- 📈 **Histórico**: Analise gráficos na aba "Histórico"

## 🎮 Modos de Operação

### 🔄 Modo Automático (Padrão)
- Sistema controla relés baseado no sensor
- Solo molhado (> threshold) → Relés ligam
- Solo seco (< threshold) → Relés desligam
- **Display LCD**: `Auto U:XX% ON/OFF`

### 📱 Modo Manual (Via App)
- Você controla quando liga/desliga
- Sensor continua lendo, mas não controla relés
- **Display LCD**: `App  U:XX% ON/OFF`

## 📊 Formato de Dados

O Arduino envia dados via Bluetooth a cada 10 segundos:
```
DADOS|45|620|ON|AUTO
      │  │  │  └─ Modo (AUTO/MANUAL)
      │  │  └─── Status dos relés (ON/OFF)
      │  └────── Valor bruto (0-1023)
      └───────── Umidade % (0-100)
```

## 🎯 Comandos Bluetooth

Você pode enviar comandos via app ou Serial Monitor:

| Comando | Descrição |
|---------|-----------|
| `LIGAR` ou `ON` ou `1` | Liga sistema (modo manual) |
| `DESLIGAR` ou `OFF` ou `0` | Desliga sistema |
| `AUTO` | Volta ao modo automático |
| `STATUS` | Retorna status atual |
| `THRESHOLD:600` | Ajusta limite de umidade |
| `DEVICE_ID:xxx` | Configura ID do dispositivo |

## 🛠️ Arquivos Importantes

- **ARDUINO_SOLO_HC05.ino** - Código do Arduino completo
- **GUIA_CONEXAO_HC05.md** - Guia detalhado de conexão
- **src/hooks/useBluetoothConnection.tsx** - Hook React para Bluetooth
- **src/components/Dashboard.tsx** - Interface principal

## ⚙️ Ajuste do Threshold

O threshold define quando o solo é considerado "molhado":

```cpp
int threshold = 600;  // Valor padrão
```

**Calibração típica:**
- Solo seco: 200-400
- Solo úmido: 400-600
- Solo molhado: 600-900

Ajuste via comando Bluetooth:
```
THRESHOLD:700
```

## 🔍 Troubleshooting

### HC-05 não aparece
- ✅ LED piscando rapidamente?
- ✅ Divisor de tensão instalado?
- ✅ Navegador suporta Web Bluetooth?
- ✅ Tente resetar o Arduino

### Não controla os relés
- ✅ Código carregado corretamente?
- ✅ Relés em 5V com GND comum?
- ✅ Pinos D7 e D8 conectados?
- ✅ Teste manualmente via Serial Monitor

### LCD em branco
- ✅ Endereço I2C correto? (0x27 ou 0x3F)
- ✅ Contraste ajustado?
- ✅ SDA/SCL nos pinos corretos?

### Sensor sempre 0 ou 100%
- ✅ Sensor em A0?
- ✅ Calibre o threshold
- ✅ Teste em solo seco e molhado

## 📞 Suporte

Consulte a documentação completa em:
- **GUIA_CONEXAO_HC05.md** - Setup e troubleshooting
- **ARDUINO_SETUP.md** - Configuração DHT22 (se usar)

## 🎓 Tecnologias

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Shadcn/ui components
- Web Bluetooth API

**Backend:**
- Supabase (Lovable Cloud)
- Edge Functions
- PostgreSQL

**Hardware:**
- Arduino Uno (ATmega328P)
- HC-05 Bluetooth
- Sensor de umidade capacitivo/resistivo

## 📄 Licença

Desenvolvido para o Sistema DAEA
*Monitoramento Automatizado de Evaporação de Água*

---

**🎯 Status**: ✅ Funcionando com Arduino Uno + HC-05
