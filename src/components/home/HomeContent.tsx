import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import HeroCard from './HeroCard';
import InfoCard from './InfoCard';
import FeatureCarousel from './FeatureCarousel';

type HomeContentProps = {
  hasPermission: boolean;
  deliveryCount: number;
  nextDeliveryLabel: string;
  nextEtaMinutes: number | null;
};

const HomeContent = ({
  hasPermission,
  deliveryCount,
  nextDeliveryLabel,
  nextEtaMinutes,
}: HomeContentProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.content}>
      <View style={styles.contentInner}>
        <HeroCard
          title="Dashboard de entregas"
          subtitle="Resumo da operação, próximas rotas e importação de planilhas em um só lugar."
        />

        <View style={styles.statsRow}>
          <InfoCard title="Entregas salvas" value={String(deliveryCount)} accent={colors.primary} />
          <InfoCard title="Próxima rota" value={nextEtaMinutes !== null ? `${nextEtaMinutes} min` : '—'} accent={colors.notification} />
        </View>

        <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.dashboardHeader}>
            <View style={[styles.dashboardIcon, { backgroundColor: colors.primary + '16' }]}>
              <Sparkles size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dashboardTitle, { color: colors.text }]}>Resumo do dia</Text>
              <Text style={[styles.dashboardText, { color: colors.textSecondary }]}>
                {nextDeliveryLabel || 'Aguardando próximas entregas para montar a rota.'}
              </Text>
            </View>
          </View>

          <Text style={[styles.dashboardMeta, { color: colors.textSecondary }]}>
            {deliveryCount > 0
              ? `${deliveryCount} entregas registradas e prontas para acompanhar.`
              : 'Ainda não há entregas salvas.'}
          </Text>
        </View>

        <FeatureCarousel />

        {!hasPermission && (
          <Text style={[styles.permissionHint, { color: colors.textSecondary }]}>
            Permita o acesso à localização para otimizar a próxima rota.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  contentInner: {
    alignItems: 'center',
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  dashboardCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dashboardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  dashboardText: {
    fontSize: 13,
    lineHeight: 20,
  },
  dashboardMeta: {
    fontSize: 13,
    lineHeight: 20,
  },
  permissionHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default HomeContent;
