import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeContext';
import ImportSection from '../components/import/ImportSection';
import DeliveryListCard from '../components/deliveries/DeliveryListCard';
import BottomNavBar, { BottomTabKey } from '../components/navigation/BottomNavBar';
import {
  listDeliveries,
  LocalDeliveryRecord,
  seedDeliveriesFromGeocoded,
  updateDeliveryObservations,
  updateDeliveryStatus,
  updateDeliveryTime,
} from '../storage/localDatabase';
import {
  calculateRouteSequence,
  getEtaMinutes,
  getDistanceKm,
} from '../storage/deliveryRouting';
import { geocodeAddressText } from '../geocoding/geocoder';
import { buildAddressKey } from '../storage/deliveries';
import { setCachedCoordinates } from '../storage/geocodeCache';

type DeliveriesScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

function isValidCep(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8;
}

function normalizeCep(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return value;
}

function hasValidCoords(d: { latitude?: number; longitude?: number }): boolean {
  return (
    typeof d?.latitude === 'number' &&
    typeof d?.longitude === 'number' &&
    Number.isFinite(d.latitude) &&
    Number.isFinite(d.longitude) &&
    d.latitude >= -90 &&
    d.latitude <= 90 &&
    d.longitude >= -180 &&
    d.longitude <= 180
  );
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const DeliveriesScreen = ({ navigation }: DeliveriesScreenProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [deliveries, setDeliveries] = useState<LocalDeliveryRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBairro, setSelectedBairro] = useState('');
  const [drafts, setDrafts] = useState<
    Record<string, { observacoes: string; deliveryTime: string }>
  >({});

  const [manualVisible, setManualVisible] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    nome: '',
    endereco: '',
    cidade: '',
    bairro: '',
    cep: '',
    telefone: '',
  });

  const updateManualField = (
    field: keyof typeof manualForm,
    value: string,
  ) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
  };

  const openManualModal = () => {
    setManualForm({
      nome: '',
      endereco: '',
      cidade: '',
      bairro: '',
      cep: '',
      telefone: '',
    });
    setManualVisible(true);
  };

  const handleAddManualRoute = async () => {
    const nome = manualForm.nome.trim();
    const endereco = manualForm.endereco.trim();
    const cidade = manualForm.cidade.trim();
    const bairro = manualForm.bairro.trim();
    const cepRaw = manualForm.cep.trim();
    const telefone = manualForm.telefone.trim();

    if (!nome) {
      Alert.alert('Campo obrigatório', 'Informe o nome do destinatário.');
      return;
    }
    if (!endereco) {
      Alert.alert('Campo obrigatório', 'Informe o endereço.');
      return;
    }
    if (!cepRaw) {
      Alert.alert('Campo obrigatório', 'Informe o CEP.');
      return;
    }
    if (!isValidCep(cepRaw)) {
      Alert.alert('CEP inválido', 'Informe um CEP com 8 dígitos.');
      return;
    }

    const cep = normalizeCep(cepRaw);

    setSavingManual(true);
    try {
      const searchEndereco = [endereco, bairro, cidade]
        .filter(Boolean)
        .join(', ');
      const geoResult = await geocodeAddressText(searchEndereco, cep);

      if (!geoResult || !hasValidCoords(geoResult.point)) {
        Alert.alert(
          'Endereço não localizado',
          'Não foi possível encontrar as coordenadas do endereço informado. Verifique o endereço, cidade e CEP.',
        );
        return;
      }

      const now = Date.now();
      const id = generateId();

      const finalCidade = cidade || geoResult.cidade || '';
      const finalBairro = bairro || geoResult.bairro || '';

      const addressKey = buildAddressKey(endereco, finalBairro, finalCidade, cep);
      await setCachedCoordinates(addressKey, geoResult.point);

      const record: LocalDeliveryRecord = {
        id,
        nome,
        endereco,
        bairro: finalBairro,
        cidade: finalCidade,
        cep,
        pedido: `Manual`,
        telefone: telefone || undefined,
        latitude: geoResult.point.latitude,
        longitude: geoResult.point.longitude,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      await seedDeliveriesFromGeocoded([record]);
      await refreshDeliveries();

      setManualVisible(false);
      Alert.alert(
        'Rota adicionada',
        `A rota de "${nome}" foi adicionada e exibida no mapa.`,
        [
          {
            text: 'Ver no Mapa',
            onPress: () => navigation.navigate('Map'),
          },
          { text: 'OK', style: 'cancel' },
        ],
      );
    } catch (error) {
      console.log('[Deliveries] erro ao adicionar rota manual:', error);
      Alert.alert(
        'Erro',
        'Não foi possível adicionar a rota. Tente novamente.',
      );
    } finally {
      setSavingManual(false);
    }
  };

  const refreshDeliveries = useCallback(async () => {
    try {
      const data = await listDeliveries();
      setDeliveries(data);
      setDrafts(prev => {
        const next = { ...prev };
        data.forEach(item => {
          if (!next[item.id]) {
            next[item.id] = {
              observacoes: item.observacoes ?? '',
              deliveryTime: item.deliveryTime ?? '',
            };
          }
        });
        return next;
      });
    } catch (error) {
      console.log('[Deliveries] erro ao carregar entregas:', error);
      setDeliveries([]);
    }
  }, []);

  useEffect(() => {
    refreshDeliveries();
    const unsubscribe = navigation.addListener?.('focus', refreshDeliveries);
    return unsubscribe;
  }, [navigation, refreshDeliveries]);

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deliveries.filter(item => {
      const matchesQuery =
        !query ||
        [item.nome, item.endereco, item.bairro, item.cidade, item.pedido]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesCity = !selectedCity || item.cidade === selectedCity;
      const matchesBairro = !selectedBairro || item.bairro === selectedBairro;
      return matchesQuery && matchesCity && matchesBairro;
    });
  }, [deliveries, search, selectedCity, selectedBairro]);

  const route = useMemo(() => {
    const startPoint = { latitude: -23.5505, longitude: -46.6333 };
    return calculateRouteSequence(filteredDeliveries, startPoint);
  }, [filteredDeliveries]);

  const nextDelivery = route[0];
  const nextDistanceKm = nextDelivery
    ? getDistanceKm(
        { latitude: -23.5505, longitude: -46.6333 },
        nextDelivery,
      )
    : null;

  const updateDraft = (
    id: string,
    field: 'observacoes' | 'deliveryTime',
    value: string,
  ) => {
    setDrafts(prev => ({
      ...prev,
      [id]: {
        observacoes: prev[id]?.observacoes ?? '',
        deliveryTime: prev[id]?.deliveryTime ?? '',
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveDraft = async (id: string) => {
    const draft = drafts[id];
    if (!draft) {
      return;
    }
    try {
      await updateDeliveryObservations(id, draft.observacoes);
      await updateDeliveryTime(id, draft.deliveryTime);
      await refreshDeliveries();
      Alert.alert('Atualizado', 'Observações e horário foram salvos.');
    } catch (error) {
      console.log('[Deliveries] erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados da entrega.');
    }
  };

  const handleStatus = async (
    id: string,
    status: LocalDeliveryRecord['status'],
  ) => {
    try {
      await updateDeliveryStatus(id, status);
      await refreshDeliveries();
      Alert.alert(
        'Status atualizado',
        status === 'delivered'
          ? 'Entrega marcada como entregue.'
          : 'Entrega marcada como não entregue.',
      );
    } catch (error) {
      console.log('[Deliveries] erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const openPhone = (phone?: string) => {
    if (!phone) {
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const openWhatsapp = (phone?: string) => {
    if (!phone) {
      return;
    }
    const digits = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${digits}`);
  };

  const handleBottomNav = useCallback(
    (tab: BottomTabKey) => {
      if (tab === 'OfflineMaps') {
        navigation.navigate('OfflineMaps');
        return;
      }

      if (tab === 'Home') {
        navigation.navigate('Home');
        return;
      }

      if (tab === 'Map') {
        navigation.navigate('Map');
        return;
      }

      navigation.navigate('Deliveries');
    },
    [navigation],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Gestão de entregas
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {deliveries.length} entregas salvas localmente
          </Text>
          <TouchableOpacity
            style={[styles.addRouteButton, { backgroundColor: colors.primary }]}
            onPress={openManualModal}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Adicionar rota manual</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Próxima entrega
          </Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {nextDelivery
              ? `${nextDelivery.nome} • ${nextDelivery.bairro || nextDelivery.cidade || 'Endereço'}`
              : 'Nenhuma entrega pendente.'}
          </Text>
          {nextDistanceKm !== null && nextDistanceKm > 0 && (
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              Distância restante: {nextDistanceKm.toFixed(1)} km • ETA:{' '}
              {getEtaMinutes(nextDistanceKm)} min
            </Text>
          )}
        </View>

        <View style={styles.filterRow}>
          <TextInput
            placeholder="Buscar entrega"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />
        </View>

        <View style={styles.filterRow}>
          <TextInput
            placeholder="Filtrar cidade"
            placeholderTextColor={colors.textSecondary}
            value={selectedCity}
            onChangeText={setSelectedCity}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />
          <TextInput
            placeholder="Filtrar bairro"
            placeholderTextColor={colors.textSecondary}
            value={selectedBairro}
            onChangeText={setSelectedBairro}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />
        </View>

        {filteredDeliveries.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma entrega encontrada.
          </Text>
        )}

        {filteredDeliveries.map(item => {
          const draft = drafts[item.id] ?? {
            observacoes: item.observacoes ?? '',
            deliveryTime: item.deliveryTime ?? '',
          };
          return (
            <View
              key={item.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <DeliveryListCard
                name={item.nome}
                subtitle={item.pedido}
                address={`${item.endereco}${item.bairro ? ` • ${item.bairro}` : ''}${item.cidade ? ` • ${item.cidade}` : ''}`}
                statusLabel={
                  item.status === 'delivered'
                    ? 'Entregue'
                    : item.status === 'undelivered'
                      ? 'Não entregue'
                      : 'Pendente'
                }
                statusColor={
                  item.status === 'delivered'
                    ? colors.primary
                    : colors.notification
                }
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleStatus(item.id, 'delivered')}
                >
                  <Text style={styles.actionButtonText}>Entregue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.notification },
                  ]}
                  onPress={() => handleStatus(item.id, 'undelivered')}
                >
                  <Text style={styles.actionButtonText}>Não entregue</Text>
                </TouchableOpacity>
              </View>

              {item.telefone ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.smallButton, { borderColor: colors.border }]}
                    onPress={() => openPhone(item.telefone)}
                  >
                    <Text style={[styles.smallButtonText, { color: colors.text }]}>
                      Ligar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, { borderColor: colors.border }]}
                    onPress={() => openWhatsapp(item.telefone)}
                  >
                    <Text style={[styles.smallButtonText, { color: colors.text }]}>
                      WhatsApp
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <TextInput
                placeholder="Observações"
                placeholderTextColor={colors.textSecondary}
                value={draft.observacoes}
                onChangeText={value => updateDraft(item.id, 'observacoes', value)}
                multiline
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <TextInput
                placeholder="Horário da entrega"
                placeholderTextColor={colors.textSecondary}
                value={draft.deliveryTime}
                onChangeText={value => updateDraft(item.id, 'deliveryTime', value)}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSaveDraft(item.id)}
              >
                <Text style={styles.actionButtonText}>
                  Salvar observações/horário
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.importSection}>
          <ImportSection
            disabled={false}
            onImportComplete={() => navigation.navigate('Map')}
          />
        </View>
      </ScrollView>

      <BottomNavBar activeTab="Deliveries" onNavigate={handleBottomNav} />

      <Modal
        visible={manualVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !savingManual && setManualVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => !savingManual && setManualVisible(false)}
          />

          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Adicionar rota manual
              </Text>
              <TouchableOpacity
                onPress={() => !savingManual && setManualVisible(false)}
                disabled={savingManual}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Nome *
              </Text>
              <TextInput
                placeholder="Nome do destinatário"
                placeholderTextColor={colors.textSecondary}
                value={manualForm.nome}
                onChangeText={value => updateManualField('nome', value)}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Endereço *
              </Text>
              <TextInput
                placeholder="Rua, número e complemento"
                placeholderTextColor={colors.textSecondary}
                value={manualForm.endereco}
                onChangeText={value => updateManualField('endereco', value)}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Bairro
              </Text>
              <TextInput
                placeholder="Bairro (opcional - se vazio, tentamos detectar)"
                placeholderTextColor={colors.textSecondary}
                value={manualForm.bairro}
                onChangeText={value => updateManualField('bairro', value)}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Cidade
              </Text>
              <TextInput
                placeholder="Cidade (opcional - se vazio, tentamos detectar)"
                placeholderTextColor={colors.textSecondary}
                value={manualForm.cidade}
                onChangeText={value => updateManualField('cidade', value)}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                CEP *
              </Text>
              <TextInput
                placeholder="00000-000"
                placeholderTextColor={colors.textSecondary}
                value={manualForm.cep}
                onChangeText={value => updateManualField('cep', value)}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Telefone (opcional)
              </Text>
              <TextInput
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.textSecondary}
                value={manualForm.telefone}
                onChangeText={value => updateManualField('telefone', value)}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setManualVisible(false)}
                disabled={savingManual}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddManualRoute}
                disabled={savingManual}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonText}>
                  {savingManual ? 'Adicionando...' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { marginBottom: 14, gap: 4 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  summaryCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  summaryText: { fontSize: 13, lineHeight: 20 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  input: {
    flex: 1,
    minWidth: 140,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 76,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#FFFFFF', fontWeight: '700' },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  smallButtonText: { fontWeight: '700' },
  saveButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: { textAlign: 'center', marginVertical: 24 },
  importSection: { marginTop: 8 },
  addRouteButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    alignSelf: 'center',
    borderRadius: 18,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  modalClose: { fontSize: 18, fontWeight: '700', paddingHorizontal: 4 },
  modalScroll: { flexGrow: 0 },
  modalScrollContent: { paddingBottom: 4 },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalButtonText: { fontWeight: '700' },
});

export default DeliveriesScreen;
