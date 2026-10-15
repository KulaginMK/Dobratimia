import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapIllustration, MapKind, ScreenHeader } from '@/components/blocks';
import { Button } from '@/components/ui';
import { MAP_URL } from '@/data/team';
import { useOpenLink } from '@/lib/links';
import { useTheme } from '@/theme';

/**
 * «Карта» (эталон MapStub): заглушка с иллюстрацией. Кнопка открывает подборку мест в Google Maps;
 * встроенная карта появится позже и только в веб-версии (docs/01, docs/07).
 */
export function MapScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openLink = useOpenLink();

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Карта"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          <MapIllustration />
        </View>
        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.xl, gap: t.space.xs }}>
          <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            Карта бережных мест
          </Text>
          <Text style={[t.type.body, { color: t.color.textMuted }]}>
            Тихие кафе, парки и уголки, где можно побыть одному или выдохнуть между парами. Мы собираем их вместе со
            студентами.
          </Text>
        </View>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.xl, gap: t.space.xs }}>
          <MapKind tone="primary">Тихие кафе и коворкинги</MapKind>
          <MapKind tone="growth">Парки и скверы</MapKind>
          <MapKind tone="accent">Психологические службы вузов</MapKind>
        </View>

        <View style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <Button size="lg" icon="map" fullWidth onPress={() => openLink(MAP_URL)}>
            Открыть карту в Google Maps
          </Button>
          <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
            Откроется приложение Google Maps. Карта внутри Добратимии появится в следующих версиях.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
