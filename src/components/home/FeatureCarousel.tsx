import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { PackageCheck, MapPinned, Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type FeatureItem = {
  title: string;
  text: string;
  icon: React.ElementType;
};

const FeatureCarousel = () => {
  const { colors } = useAppTheme();

  const items: FeatureItem[] = [
    { title: 'Rotas rápidas', text: 'Priorize entregas e siga a ordem ideal.', icon: RouteIcon },
    { title: 'Mapa offline', text: 'Baixe áreas e trabalhe sem depender da rede.', icon: MapPinned },
    { title: 'Tudo em um só lugar', text: 'Gestão, observações e status em uma tela simples.', icon: Sparkles },
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.text }]}>Destaques</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <View key={`${item.title}-${index}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <View style={[styles.icon, { backgroundColor: colors.primary + '16' }]}> 
                <Icon size={18} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>{item.text}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const RouteIcon = ({ size, color }: { size: number; color: string }) => <PackageCheck size={size} color={color} />;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  content: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 180,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default FeatureCarousel;
