# 🔧 Configuração do Arduino Uno com HC-05

## 📋 Componentes Necessários

- Arduino Uno
- Módulo Bluetooth HC-05
- Sensor DHT22 (temperatura e umidade do ar)
- Sensor de umidade do solo capacitivo ou resistivo
- Display LCD 16x2 com interface I2C
- Módulo relé 5V (1 canal)
- Fonte de alimentação adequada
- Jumpers e protoboard

## 🔌 Conexões dos Componentes

### HC-05 (Módulo Bluetooth)
```
HC-05 VCC  → Arduino 5V
HC-05 GND  → Arduino GND
HC-05 TX   → Arduino D10 (RX no código)
HC-05 RX   → Arduino D11 (TX no código) **COM DIVISOR DE TENSÃO 5V→3.3V**
```

**IMPORTANTE**: O HC-05 funciona em 3.3V na comunicação serial. Use um divisor de tensão (resistores 1kΩ e 2kΩ) entre o TX do Arduino (D11) e o RX do HC-05.

### DHT22 (Sensor de Temperatura e Umidade)
```
DHT22 VCC  → Arduino 5V
DHT22 GND  → Arduino GND
DHT22 DATA → Arduino D4
```

### Sensor de Umidade do Solo
```
Sensor VCC → Arduino 5V
Sensor GND → Arduino GND
Sensor A0  → Arduino A0
```

### Display LCD I2C
```
LCD VCC → Arduino 5V
LCD GND → Arduino GND
LCD SDA → Arduino A4 (SDA)
LCD SCL → Arduino A5 (SCL)
```

### Módulo Relé
```
Relé VCC → Arduino 5V
Relé GND → Arduino GND
Relé IN  → Arduino D2
```

## 📚 Bibliotecas Necessárias

Instale as seguintes bibliotecas pela IDE do Arduino:

1. **DHT sensor library** por Adafruit
2. **LiquidCrystal I2C** por Frank de Brabander
3. **Wire** (já incluída no Arduino IDE)
4. **SoftwareSerial** (já incluída no Arduino IDE)

## 🚀 Como Configurar

### 1. Configure o HC-05 (Primeira vez)

Antes de conectar ao circuito, configure o HC-05:

```
1. Entre no modo AT:
   - Desconecte o VCC do HC-05
   - Pressione e segure o botão no HC-05
   - Conecte o VCC enquanto segura o botão
   - O LED deve piscar lentamente (modo AT)

2. Conecte HC-05 ao Arduino via Serial
3. Abra o Serial Monitor (9600 baud)
4. Configure o nome:
   AT+NAME=DAEA-Arduino
5. Configure o PIN:
   AT+PSWD=1234
```

### 2. Carregue o Código

1. Abra o arquivo `ARDUINO_UNO_CODE.ino` no Arduino IDE
2. Verifique as conexões dos pinos no código
3. Conecte o Arduino ao computador via USB
4. Selecione a placa: **Arduino Uno**
5. Selecione a porta COM correta
6. Clique em "Upload"

### 3. Configure o Device ID (Opcional)

O código já vem com um ID padrão, mas você pode configurar via Bluetooth:
```
Envie: DEVICE_ID:seu-novo-id-aqui
```

## 📱 Conectando ao App

### Via Bluetooth Web API

1. Abra o app no navegador Chrome, Edge ou Opera
2. Clique em "Conectar Arduino"
3. Selecione a aba "Bluetooth HC-05"
4. Clique em "Conectar via Bluetooth"
5. Selecione "DAEA-Arduino" ou "HC-05" na lista
6. Aguarde a conexão

### Comandos Disponíveis via Bluetooth

```
LIGAR ou ON ou 1     → Liga o sistema
DESLIGAR ou OFF ou 0 → Desliga o sistema
STATUS               → Retorna o status atual
DEVICE_ID:xxx        → Configura o ID do dispositivo
```

## 🔍 Monitoramento

### Monitor Serial (9600 baud)
O Arduino envia logs detalhados via Serial:
```
🌡️  Temperatura: 25.5 °C
💧 Umidade Ar: 65.2 %
🌱 Umidade Solo: 45 %
📏 Nível Água: 55.3 cm
💨 Taxa Evaporação: 2.45 mm/h
⚡ Sistema: 🟢 LIGADO
```

### Display LCD
Mostra em tempo real:
```
Linha 1: T:25.5C U:65%
Linha 2: Solo:45% ON
```

### Via Bluetooth
Dados enviados a cada 10 segundos quando sistema está ligado:
```
DADOS|25.50|65.20|45|55.30|2.45
```

## 🎛️ Funcionamento

1. **Inicialização**: Sistema liga com relé desligado
2. **Leitura de Sensores**: A cada 2 segundos
3. **Display LCD**: Atualização contínua
4. **Monitor Serial**: Logs detalhados
5. **Bluetooth**: Envia dados a cada 10 segundos (quando ligado)
6. **Controle Remoto**: Via app web

## ⚡ Controle do Sistema

O relé (pino D2) é controlado pelo estado do sistema:
- Sistema LIGADO → Relé ativado (HIGH)
- Sistema DESLIGADO → Relé desativado (LOW)

Use o relé para controlar:
- Bomba de água
- Ventilador
- Sistema de irrigação
- Qualquer dispositivo que precise ser controlado

## 🔧 Troubleshooting

### HC-05 não aparece no Bluetooth
- Verifique se o LED está piscando rapidamente
- Confirme que o VCC está em 5V
- Teste emparelhamento manual no celular primeiro

### DHT22 retorna NaN
- Verifique conexões VCC, GND e DATA
- Adicione resistor pull-up de 10kΩ entre DATA e VCC
- Aguarde 2 segundos após ligar

### Display LCD não aparece nada
- Verifique endereço I2C (pode ser 0x27 ou 0x3F)
- Use o I2C Scanner para descobrir o endereço
- Ajuste o potenciômetro de contraste no LCD

### Sensor de solo sempre 0 ou 100
- Calibre os valores no código (linha 75)
- Teste em solo seco e molhado
- Ajuste o mapeamento conforme seu sensor

### Bluetooth conecta mas não envia dados
- Verifique divisor de tensão no RX do HC-05
- Confirme baud rate: 9600
- Teste comandos via Serial Monitor primeiro

## 📊 Dados dos Sensores

### DHT22
- Temperatura: 22°C a 32°C (típico)
- Umidade: 45% a 75% (típico)
- Precisão: ±0.5°C, ±2% UR

### Sensor de Solo
- Valor bruto: 0-1023 (ADC 10 bits)
- Convertido: 0-100%
- Calibrar conforme seu sensor

### Nível de Água
- Calculado a partir do sensor de solo
- Faixa: 30-80 cm (simulado)
- Com variação aleatória realista

### Taxa de Evaporação
- Calculada: temperatura + umidade
- Faixa: 0-10 mm/h
- Fórmula: f(temp, umid)

## 🎯 Próximos Passos

1. ✅ Conectar Arduino ao app
2. ✅ Ligar/desligar sistema remotamente
3. ✅ Visualizar dados em tempo real
4. 📱 Adicionar notificações de alertas
5. 📊 Gerar gráficos históricos
6. 🔄 Implementar controle automático

## 📞 Suporte

Em caso de dúvidas:
1. Verifique as conexões físicas
2. Teste cada componente separadamente
3. Use o Monitor Serial para debug
4. Consulte o código comentado

---

**Desenvolvido para o Sistema DAEA** 🌊
*Monitoramento Automatizado de Evaporação de Água*
