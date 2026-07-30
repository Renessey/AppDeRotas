# 📦 EntregasApp

**EntregasApp** é um aplicativo mobile desenvolvido em **React Native** para gerenciamento de entregas de forma rápida e eficiente. Com uma interface moderna e suporte a temas claro/escuro, o app oferece uma experiência agradável e personalizável.

## ✨ Funcionalidades

- 🚀 **Splash Screen animada** — tela de inicialização com a logomarca do app
- 🌗 **Tema claro/escuro** — alternância entre os modos light e dark com um toque
- 📱 **Interface responsiva** — adaptada para diferentes tamanhos de tela
- 🧭 **Navegação nativa** — transições suaves entre telas com React Navigation
- 🎨 **Design moderno** — paleta de cores cuidadosamente selecionada

## 📋 Pré-requisitos

Antes de começar, verifique se você possui os seguintes requisitos:

- **Node.js** >= 22.11.0
- **npm** ou **yarn**
- **React Native CLI** (versão 20.1.0)
- **Android Studio** (para desenvolvimento Android)
- **Xcode** (para desenvolvimento iOS — somente macOS)
- **CocoaPods** (para dependências iOS)

> 💡 Consulte o guia oficial [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) para configurar seu ambiente de desenvolvimento.

## 🔧 Instalação

Siga os passos abaixo para configurar o projeto localmente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/entregasapp.git

# Acesse o diretório do projeto
cd EntregasApp

# Instale as dependências
npm install
# ou
yarn install

# iOS: instale as dependências do CocoaPods (apenas na primeira vez ou após atualizações)
cd ios && bundle install && bundle exec pod install && cd ..
```

## 🚀 Executando o app

### Iniciar o Metro Bundler

O **Metro** é o bundler JavaScript do React Native. Para iniciá-lo:

```bash
npm start
# ou
yarn start
```

### Android

Com o Metro rodando, execute em outro terminal:

```bash
npm run android
# ou
yarn android
```

### iOS

```bash
npm run ios
# ou
yarn ios
```

> ✅ Se tudo estiver configurado corretamente, o app será exibido no emulador/dispositivo conectado.

## 📁 Estrutura do projeto

```
EntregasApp/
├── android/                  # Código nativo Android
├── ios/                      # Código nativo iOS
├── logos/                    # Recursos de imagem (logotipos)
│   └── logoSplash.png
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Configuração de navegação (Stack)
│   ├── screens/
│   │   ├── SplashScreen.tsx  # Tela de splash inicial
│   │   └── HomeScreen.tsx    # Tela principal do app
│   └── theme/
│       ├── colors.ts         # Paleta de cores (claro/escuro)
│       └── ThemeContext.tsx   # Contexto para alternância de temas
├── App.tsx                   # Componente raiz do app
├── index.js                  # Ponto de entrada do React Native
├── package.json
└── README.md
```

## 🎨 Personalização

### Cores

As cores do aplicativo podem ser facilmente personalizadas no arquivo `src/theme/colors.ts`:

```typescript
// Cores do tema claro
export const lightColors = {
  primary: '#4F46E5',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  // ...
};

// Cores do tema escuro
export const darkColors = {
  primary: '#818CF8',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  // ...
};
```

### Tema

O contexto de tema (`ThemeContext.tsx`) gerencia automaticamente o tema com base na preferência do sistema, permitindo também a alternância manual pelo botão na tela inicial.

## 🛠️ Tecnologias utilizadas

| Tecnologia                  | Versão   | Finalidade                        |
|-----------------------------|----------|-----------------------------------|
| React Native                | 0.86.2   | Framework mobile                  |
| React                       | 19.2.3   | Biblioteca UI                     |
| TypeScript                  | ^5.8.3   | Tipagem estática                  |
| @react-navigation/native    | ^7.3.14  | Navegação entre telas             |
| @react-navigation/native-stack | ^7.18.6 | Navegação nativa em pilha       |
| react-native-safe-area-context | ^5.5.2 | Áreas seguras do dispositivo      |
| lucide-react-native         | ^1.28.0  | Ícones                            |
| react-native-svg            | ^15.15.5 | Renderização SVG (ícones)         |

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com ❤️ usando React Native
</p>

