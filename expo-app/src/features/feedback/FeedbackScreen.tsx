import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CareNote, InlineLink, ScreenHeader } from '@/components/blocks';
import { Button, TextField, useToast } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { TEAM_EMAIL } from '@/data/team';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';
import { feedbackMailUrl } from './mail';

const MESSAGE_MAX = 2000;

/** «Обратная связь»: открывается из «О проекте» и профиля. Макета нет. */
export function FeedbackScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const call = useCallPhone();
  const [message, setMessage] = useState('');

  const send = () => {
    Linking.openURL(feedbackMailUrl(message, Platform.OS === 'web' ? 'веб' : 'Android')).catch(() => {
      toast.show({ message: `Не удалось открыть почту. Напишите нам на ${TEAM_EMAIL}`, tone: 'error' });
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Обратная связь"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: t.space.sm,
          paddingHorizontal: t.space.screen,
          paddingBottom: insets.bottom + t.space.xl,
          gap: t.space.md,
        }}
      >
        <Text style={[t.type.body, { color: t.color.text }]}>
          Расскажите, что понравилось, что неудобно и чего не хватает. Письмо откроется в вашей почте — там его можно
          проверить и отправить.
        </Text>
        <TextField
          label="Сообщение"
          multiline
          rows={6}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={setMessage}
        />
        <Button size="lg" icon="message" fullWidth disabled={!message.trim()} onPress={send}>
          Отправить через почту
        </Button>
        <Text selectable style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
          {`Или напишите напрямую: ${TEAM_EMAIL}`}
        </Text>
        {/* Письма читают не сразу: тому, кому плохо прямо сейчас, нужен номер, а не форма. */}
        <CareNote onPress={() => call(PSYCH_HELPLINE)} accessibilityHint={`Позвонить на номер ${PSYCH_HELPLINE}`}>
          {'Мы читаем письма не сразу. Если тяжело прямо сейчас — звоните '}
          <InlineLink strong>{PSYCH_HELPLINE}</InlineLink>.
        </CareNote>
      </ScrollView>
    </View>
  );
}
