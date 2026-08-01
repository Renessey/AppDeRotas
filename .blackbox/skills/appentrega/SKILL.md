---
name: appentrega
description: Desenvolver um aplicativo React Native para entregadores totalmente funcional offline utilizando MapLibre + MBTiles + SQLite, focando em desempenho, simplicidade e organização do código.
---

# skill.md

# APP DE ROTAS OFFLINE PARA ENTREGADORES

## Objetivo

Desenvolver um aplicativo React Native para entregadores totalmente funcional offline utilizando MapLibre + MBTiles + SQLite, focando em desempenho, simplicidade e organização do código.

---

# Stack

- React Native
- TypeScript
- React Navigation
- Expo (Development Build)
- MapLibre
- MBTiles
- SQLite
- react-native-fs
- react-native-document-picker
- xlsx
- papaparse
- react-native-geolocation-service
- react-native-permissions
- Lucide React Native
- React Native Reanimated
- MMKV (configurações)

---

# Objetivos da IA

Ao modificar o projeto:

- manter código limpo
- manter componentes pequenos
- evitar duplicação
- reutilizar componentes
- usar TypeScript corretamente
- seguir a estrutura existente
- sempre preservar performance

---

# Regras Obrigatórias

## Nunca executar

NUNCA execute comandos que iniciem o aplicativo, incluindo:

- npm run android
- npm run ios
- npm start
- npx react-native run-android
- npx react-native run-ios
- expo start
- yarn android
- yarn ios
- bun run

Esses comandos são responsabilidade do desenvolvedor.

---

## Pode executar

Caso necessário:

- instalar dependências
- criar arquivos
- editar arquivos
- mover arquivos
- remover arquivos não utilizados
- atualizar imports
- corrigir TypeScript
- corrigir ESLint
- corrigir Prettier

Nunca iniciar o projeto.

---

# Forma de Responder

Responder de forma objetiva.

Evitar explicações longas.

Sempre que possível responder:

- arquivo criado
- arquivo alterado
- motivo

Nada além disso.

---

# Organização de Pastas

src/

    components/
    screens/
    navigation/
    theme/
    hooks/
    services/
    database/
    repositories/
    storage/
    maps/
    utils/
    types/
    constants/
    assets/

---

# Convenções

Componentes:

NomeComponente.tsx

Hooks:

useNome.ts

Serviços:

NomeService.ts

Banco:

NomeRepository.ts

Tipos:

Nome.ts

---

# Estilo

Sempre utilizar:

- functional components
- hooks
- async/await
- TypeScript estrito
- StyleSheet.create()

Evitar bibliotecas desnecessárias.

---

# Interface

Prioridades:

- rápida
- limpa
- moderna
- intuitiva

Utilizar:

- Lucide
- animações leves
- loading elegante
- feedback visual

---

# Tema

Suporte obrigatório:

- Light
- Dark

Nunca quebrar o ThemeContext.

---

# Offline First

O aplicativo deve funcionar sem internet sempre que possível.

Prioridades:

1. SQLite
2. MBTiles
3. Cache local
4. Sincronização posterior

---

# Banco

SQLite será a fonte principal de dados.

Nunca depender da internet para consultas locais.

---

# Mapas

Utilizar apenas:

MapLibre + MBTiles

Não utilizar Google Maps.

---

# Geocodificação

Geocodificar apenas quando necessário.

Nunca repetir conversões já existentes.

Sempre salvar latitude e longitude.

---

# Performance

Priorizar:

- FlatList
- memo
- useMemo
- useCallback

Evitar renderizações desnecessárias.

---

# Código

Sempre produzir código completo.

Não deixar TODO.

Não deixar placeholders.

Não remover funcionalidades existentes.

---

# Antes de editar

Verificar:

- impacto
- imports
- tipos
- navegação
- tema

---

# Arquivos

Ao criar novos arquivos:

- seguir a estrutura existente
- nomes consistentes
- sem arquivos duplicados

---

# Qualidade

Sempre:

- código limpo
- fácil manutenção
- fácil leitura

---

# Fluxo de Trabalho

1. Entender a tarefa.
2. Alterar apenas os arquivos necessários.
3. Preservar funcionalidades existentes.
4. Evitar mudanças desnecessárias.
5. Entregar rapidamente.

---

# Roadmap

Seguir rigorosamente as fases do projeto:

1. Configuração
2. Mapa Offline
3. Importação
4. Geocodificação
5. SQLite
6. Entregas
7. Roteirização
8. Navegação
9. Detalhes
10. Dashboard
11. Sincronização
12. Configurações
13. Recursos futuros
14. Polimento

Nunca implementar funcionalidades fora da fase solicitada, salvo solicitação explícita do desenvolvedor.

---

# Prioridade Máxima

1. Estabilidade
2. Performance
3. Offline
4. Organização
5. Simplicidade

---

# Restrições

- Nunca iniciar o aplicativo.
- Nunca executar comandos de build ou execução.
- Nunca alterar configurações sem necessidade.
- Nunca adicionar dependências sem justificativa.
- Nunca modificar código não relacionado à tarefa.

---

# Padrão de Entrega

Responder sempre no formato:

## Arquivos criados

- caminho/arquivo

## Arquivos alterados

- caminho/arquivo

## Resumo

Descrição objetiva das alterações realizadas.

Sem explicações extensas, a menos que sejam solicitadas.