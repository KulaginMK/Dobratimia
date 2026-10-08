import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhotoRow, ScreenHeader, SettingsGroup } from '@/components/blocks';
import { Button, Chip, Switch, TextField, useToast } from '@/components/ui';
import { OfflineError, type Cabinet } from '@/data/repos';
import { useTheme } from '@/theme';
import { CabinetFallback, useCabinet } from './Cabinet';
import {
  MAX_SPECIALIZATIONS,
  QUOTE_MAX,
  SPECIALIZATIONS,
  toFields,
  toForm,
  validate,
  type CardForm,
  type FormErrors,
} from './form';

/** Редактирование карточки (эталон CabEdit). Открывается поверх вкладок кабинета, без индикатора. */
export function CabinetEditScreen() {
  const t = useTheme();
  const router = useRouter();
  const { cabinet } = useCabinet();
  // Всегда к «Моей карточке» — и когда редактирование открыли прямо по адресу, минуя её.
  const close = () => router.dismissTo('/cabinet');
  if (cabinet) return <EditForm cabinet={cabinet} onClose={close} />;
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader title="Редактирование" leading="close" leadingLabel="Отменить" onLeadingPress={close} />
      <CabinetFallback />
    </View>
  );
}

function EditForm({ cabinet, onClose }: { cabinet: Cabinet; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { submit } = useCabinet();
  const [form, setForm] = useState<CardForm>(() => toForm(cabinet.fields));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<CardForm>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // После неудачного «Сохранить» подсказки обновляются по ходу правки: исправленное поле перестаёт быть красным.
    if (Object.keys(errors).length > 0) setErrors(validate(next));
  };
  // Специализация не из списка (её вписал администратор) остаётся чипом: иначе она молча пропала бы при сохранении.
  const options = [...SPECIALIZATIONS, ...form.specializations.filter((tag) => !SPECIALIZATIONS.includes(tag))];
  const full = form.specializations.length >= MAX_SPECIALIZATIONS;

  const save = async () => {
    if (saving) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.show({ message: 'Проверьте поля с подсказками', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      await submit(toFields(form));
      toast.show({ message: 'Изменения отправлены на проверку', tone: 'success' });
      onClose();
    } catch (error) {
      setSaving(false);
      if (error instanceof OfflineError) {
        toast.show({ message: 'Нет интернета', tone: 'error', actionLabel: 'Повторить', onAction: save });
      } else {
        toast.show({ message: 'Не удалось сохранить. Попробуйте ещё раз.', tone: 'error' });
      }
    }
  };

  const section = { paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.md };
  const heading = [t.type.h3, { color: t.color.text }];
  const chips = { flexDirection: 'row', flexWrap: 'wrap', columnGap: t.space.xs } as const;
  const caption = [t.type.caption, { color: t.color.textMuted }];

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Редактирование"
        leading="close"
        leadingLabel="Отменить"
        onLeadingPress={onClose}
        trailing={
          <Button variant="text" disabled={saving} onPress={save}>
            Сохранить
          </Button>
        }
      />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + t.space.xl }}
        >
          <View style={[section, { paddingTop: t.space.md }]}>
            <Text accessibilityRole="header" style={heading}>
              Фото и имя
            </Text>
            <PhotoRow
              name={form.name}
              actionLabel="Заменить фото"
              hint="Лицо крупно, светлый фон"
              // Загрузка фото — следующий шаг этапа 13 (TODO.md).
              onAction={() => toast.show({ message: 'Загрузка фото скоро появится' })}
            />
            <TextField label="Имя и фамилия" value={form.name} error={errors.name} onChange={(name) => set({ name })} />
            <TextField
              label="Кто вы"
              value={form.title}
              hint="Например: психолог, психотерапевт, клинический психолог"
              error={errors.title}
              onChange={(title) => set({ title })}
            />
          </View>

          <View style={section}>
            <Text accessibilityRole="header" style={heading}>
              Специализации
            </Text>
            <View style={chips}>
              {options.map((tag) => {
                const selected = form.specializations.includes(tag);
                return (
                  <Chip
                    key={tag}
                    selected={selected}
                    disabled={full && !selected}
                    onChange={(on) =>
                      set({
                        specializations: on
                          ? [...form.specializations, tag]
                          : form.specializations.filter((item) => item !== tag),
                      })
                    }
                  >
                    {tag}
                  </Chip>
                );
              })}
            </View>
            <Text style={caption}>{`Выберите до ${MAX_SPECIALIZATIONS} — они показываются на карточке`}</Text>
          </View>

          <View style={section}>
            <Text accessibilityRole="header" style={heading}>
              О себе
            </Text>
            <TextField
              label="Цитата для карточки"
              multiline
              rows={2}
              maxLength={QUOTE_MAX}
              value={form.quote}
              hint={`${form.quote.length} из ${QUOTE_MAX} знаков`}
              onChange={(quote) => set({ quote })}
            />
            <TextField label="Описание" multiline value={form.about} onChange={(about) => set({ about })} />
            <View style={{ flexDirection: 'row', gap: t.space.sm }}>
              <View style={{ flex: 1 }}>
                <TextField label="Опыт" value={form.experience} onChange={(experience) => set({ experience })} />
              </View>
              <View style={{ flex: 2 }}>
                <TextField label="Образование" value={form.education} onChange={(education) => set({ education })} />
              </View>
            </View>
          </View>

          <View style={section}>
            <Text accessibilityRole="header" style={heading}>
              Формат
            </Text>
            <View style={chips}>
              <Chip selected={form.formatOnline} onChange={(formatOnline) => set({ formatOnline })}>
                Онлайн
              </Chip>
              <Chip selected={form.formatOffline} onChange={(formatOffline) => set({ formatOffline })}>
                Очно
              </Chip>
            </View>
            {errors.format ? (
              <Text accessibilityLiveRegion="polite" style={[t.type.caption, { color: t.color.error }]}>
                {errors.format}
              </Text>
            ) : null}
            {form.formatOffline ? (
              <TextField label="Город для очных встреч" value={form.city} onChange={(city) => set({ city })} />
            ) : null}
          </View>

          <View style={section}>
            <Text accessibilityRole="header" style={heading}>
              Контакты
            </Text>
            <TextField
              label="Телефон"
              type="tel"
              value={form.phone}
              error={errors.phone}
              onChange={(phone) => set({ phone })}
            />
            <TextField
              label="Telegram"
              value={form.telegram}
              error={errors.telegram}
              onChange={(telegram) => set({ telegram })}
            />
            <TextField
              label="Ссылка на запись"
              type="url"
              placeholder="https://"
              value={form.bookingUrl}
              error={errors.bookingUrl}
              onChange={(bookingUrl) => set({ bookingUrl })}
            />
            <SettingsGroup>
              {/* Подпись длинная и переносится: без отступа текст прижимается к краям карточки. */}
              <View style={{ paddingVertical: t.space.xs }}>
                <Switch
                  label="Согласие на публикацию контактов"
                  description="Студенты увидят их после отметки «Нравится»"
                  checked={form.consent}
                  onChange={(consent) => set({ consent })}
                />
              </View>
            </SettingsGroup>
          </View>

          <View style={[section, { gap: t.space.sm }]}>
            <Text style={caption}>
              После сохранения изменения проверит администратор. До проверки студенты видят прежнюю версию карточки.
            </Text>
            <Button size="lg" fullWidth disabled={saving} onPress={save}>
              Сохранить
            </Button>
            <Button variant="outline" fullWidth onPress={onClose}>
              Отмена
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
