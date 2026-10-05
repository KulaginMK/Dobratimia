import React from 'react';
import { View } from 'react-native';
import { BottomSheet, RadioCard } from '@/components/ui';
import type { UniversityId } from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { useTheme } from '@/theme';

type Props = {
  open: boolean;
  selectedId: UniversityId | null;
  onSelect: (id: UniversityId) => void;
  onClose: () => void;
};

/** Шторка выбора вуза: тот же список, что на шаге онбординга «Где вы учитесь?». Тап по вузу — выбор. */
export function UniversityPickerSheet({ open, selectedId, onSelect, onClose }: Props) {
  const t = useTheme();
  const { universities } = useSelectedUniversity();
  return (
    <BottomSheet open={open} title="Где вы учитесь?" onClose={onClose}>
      <View accessibilityRole="radiogroup" accessibilityLabel="Вуз" style={{ gap: t.space.sm }}>
        {universities.map((university) => (
          <RadioCard
            key={university.id}
            title={university.shortName}
            description={university.fullName}
            selected={university.id === selectedId}
            onPress={() => onSelect(university.id)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}
