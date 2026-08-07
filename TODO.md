# TODO - Exibir entregas e rotas no mapa

## Passos
- [ ] 1. Atualizar `src/screens/MapScreen.tsx`:
  - [ ] Carregar entregas salvas via `listDeliveries()`.
  - [ ] Calcular a rota com `calculateRouteSequence()`.
  - [ ] Traçar a linha da rota no mapa (GeoJSONSource + Layer line).
  - [ ] Exibir marcadores das entregas (Marker).
  - [ ] Ajustar a câmera (fitBounds) para mostrar todas as entregas.
  - [ ] Atualizar entregas ao voltar à tela (focus).
- [ ] 2. Rodar `npx tsc --noEmit` para validar tipos.
- [ ] 3. Rodar `npm test`.
