# FASE 1 - TODO

## Step 1: Instalar dependências
- [x] `@react-navigation/native`
- [x] `@react-navigation/native-stack`
- [x] `react-native-screens`

## Step 2: Criar estrutura de pastas
- [x] `src/screens/`
- [x] `src/navigation/`
- [x] `src/theme/`

## Step 3: Criar tema cores (light/dark)
- [x] `src/theme/colors.ts`

## Step 4: Criar ThemeContext (toggle claro/escuro)
- [x] `src/theme/ThemeContext.tsx`

## Step 5: Criar SplashScreen
- [x] `src/screens/SplashScreen.tsx`

## Step 6: Criar HomeScreen
- [x] `src/screens/HomeScreen.tsx`

## Step 7: Criar AppNavigator
- [x] `src/navigation/AppNavigator.tsx`

## Step 8: Atualizar App.tsx
- [x] Integrar ThemeProvider + NavigationContainer + AppNavigator

---

# FASE 2 - MAPA OFFLINE

## Step 1: Instalar dependências
- [x] `@maplibre/maplibre-react-native`
- [x] `@react-native-community/netinfo`

## Step 2: Configuração nativa (permissões GPS)
- [x] `AndroidManifest.xml`: ACCESS_FINE_LOCATION + ACCESS_COARSE_LOCATION
- [x] `Info.plist`: NSLocationWhenInUseUsageDescription
- [x] Rebuild do app Android (`npx react-native run-android`)

## Step 3: Criar módulos de mapa
- [x] `src/map/offlineMaps.ts` (config + tipos)
- [x] `src/map/OfflineMapsService.ts` (download região, listar instalados, tamanho, excluir)
- [x] `src/map/location.ts` (permissão de GPS)

## Step 4: Integrar MapLibre na HomeScreen
- [x] Renderizar `MapView` em 50% da tela (não fullscreen)
- [x] Exibir localização atual (`UserLocation`)
- [x] Permissão de GPS no carregamento
- [x] Centralizar mapa no usuário (`Camera` + botão recentralizar)
- [x] Modo "selecionar área" para baixar região offline (com progresso)
- [x] Indicador online/offline via NetInfo
- [x] Botão para abrir tela de mapas offline

## Step 5: Criar tela de mapas offline
- [x] `src/screens/OfflineMapsScreen.tsx`
- [x] Listar mapas instalados (detecção via `OfflineManager.getPacks()`)
- [x] Exibir tamanho ocupado (`formatBytes`)
- [x] Excluir mapas baixados (`OfflineManager.deletePack()`)

## Step 6: Atualizar navegação e TODO
- [x] Registrar rota `OfflineMaps` no `AppNavigator`
- [x] Atualizar este TODO.md

