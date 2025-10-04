# 📱 Guia de Configuração Mobile - App DAEA

## ✅ Capacitor Configurado!

O Capacitor já está configurado no projeto. Agora você pode transformar este app React em um app nativo iOS/Android.

## 📋 Pré-requisitos

### Para Android:
- [Android Studio](https://developer.android.com/studio) instalado
- Java JDK 11 ou superior

### Para iOS:
- Mac com macOS
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) instalado (somente macOS)

## 🚀 Passos para Rodar no Dispositivo

### 1. Exportar o Projeto
Clique em **"Export to Github"** no Lovable para transferir o projeto para seu GitHub.

### 2. Clonar o Repositório
```bash
git clone <seu-repositorio-github>
cd daeatcc-app
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Adicionar Plataforma Nativa
Escolha Android ou iOS (ou ambos):

```bash
# Para Android
npx cap add android

# Para iOS (somente no Mac)
npx cap add ios
```

### 5. Atualizar Dependências Nativas
```bash
# Para Android
npx cap update android

# Para iOS
npx cap update ios
```

### 6. Build do Projeto
```bash
npm run build
```

### 7. Sincronizar com Plataforma Nativa
```bash
npx cap sync
```

### 8. Rodar o App
```bash
# Para Android
npx cap run android

# Para iOS
npx cap run ios
```

## 🔌 Recursos Nativos Disponíveis

Com Capacitor você tem acesso a:

✅ **Bluetooth Nativo** - Conexão direta com ESP32 (muito mais confiável que Web Bluetooth)
✅ **GPS/Localização** - Para rastreamento preciso
✅ **Câmera** - Captura de fotos e vídeos
✅ **Sistema de Arquivos** - Armazenamento local
✅ **Notificações Push** - Alertas em tempo real
✅ **Sensores** - Acelerômetro, giroscópio, etc.

## 📝 Próximos Passos (Depois de Instalar)

1. **Adicionar Plugin Bluetooth**: Para conexão nativa com ESP32
   ```bash
   npm install @capacitor-community/bluetooth-le
   npx cap sync
   ```

2. **Testar Conexão com ESP32**: O Bluetooth nativo é muito mais poderoso

3. **Publicar nas Lojas**:
   - [Guia Google Play Store](https://capacitorjs.com/docs/android)
   - [Guia Apple App Store](https://capacitorjs.com/docs/ios)

## 🔄 Desenvolvimento com Hot-Reload

Durante o desenvolvimento, o app mobile carrega diretamente do Lovable (URL configurada no capacitor.config.ts), permitindo ver mudanças em tempo real sem rebuild.

Para produção, remova ou comente a seção `server` do `capacitor.config.ts`.

## ❓ Problemas Comuns

### App não conecta
- Verifique se seu dispositivo está na mesma rede que o PC
- Certifique-se que a URL no capacitor.config.ts está correta

### Build falha
- Execute `npm install` novamente
- Limpe o cache: `npm run build -- --force`
- Verifique se todas as dependências estão instaladas

### Android Studio não abre
- Certifique-se que o Android Studio está instalado corretamente
- Configure as variáveis de ambiente ANDROID_HOME

## 📚 Documentação Oficial

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)

## 🎯 Benefícios do App Nativo

- ⚡ **Performance nativa** - Muito mais rápido que PWA
- 🔐 **Segurança** - Armazenamento seguro nativo
- 📱 **Presença nas lojas** - App Store e Play Store
- 🎨 **UI/UX nativa** - Gestos e animações nativas
- 🔌 **APIs completas** - Acesso total ao hardware

---

**Pronto!** Seu app React agora é um app mobile nativo completo! 🎉
