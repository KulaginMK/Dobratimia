import React, { useState } from 'react';
import { Text, TextInput, View, type KeyboardTypeOptions, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';

// Размеры из веб-эталона bundle.css (.dt-field).
const GAP = 6;
const MIN_HEIGHT = 52;
const PAD_V = 14;
const PAD_H = 16;
const BORDER = 1.5;
const BORDER_FOCUS = 2;
const LABEL_LINE = 20;
// Минимальная высота многострочного поля ≈ rows × 24 + 28 (docs/04).
const ROW_HEIGHT = 24;
const ROWS_EXTRA = 28;
const DEFAULT_ROWS = 4;

type FieldType = 'text' | 'tel' | 'email' | 'url';

const KEYBOARD: Record<FieldType, KeyboardTypeOptions> = {
  text: 'default',
  tel: 'phone-pad',
  email: 'email-address',
  url: 'url',
};

type Props = {
  /** Подпись сверху, всегда видна. Плейсхолдер подписью не считается. */
  label?: string;
  /** Нужен, если видимой подписи нет (поиск, «Выплеснуть текстом»). */
  accessibilityLabel?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Подсказка под полем. */
  hint?: string;
  /** Текст ошибки: заменяет подсказку и красит поле. Говорит, что сделать. */
  error?: string;
  multiline?: boolean;
  rows?: number;
  type?: FieldType;
  maxLength?: number;
  disabled?: boolean;
  /**
   * Личный текст, который нигде не должен остаться («Выплеснуть текстом»): без автозаполнения,
   * а в вебе ещё и без проверки орфографии — браузер может отправлять её на свои серверы.
   */
  sensitive?: boolean;
  /** Чтобы поставить курсор в поле из кода: чип-подсказка вставил начало фразы. */
  inputRef?: React.Ref<TextInput>;
  /**
   * Содержимое поверх текста поля, ровно на его месте: анимация исчезающего текста.
   * Пока оно есть, само поле пустое (текст показывает только анимация), не редактируется и не меняет высоту.
   */
  overlay?: React.ReactNode;
  onChange?: (value: string) => void;
};

/** Поле ввода с подписью, подсказкой и ошибкой. Работает и с value + onChange, и с defaultValue. */
export function TextField({
  label,
  accessibilityLabel,
  value,
  defaultValue,
  placeholder,
  hint,
  error,
  multiline,
  rows = DEFAULT_ROWS,
  type = 'text',
  maxLength,
  disabled,
  sensitive,
  inputRef,
  overlay,
  onChange,
}: Props) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  // Высота поля с текстом: многострочное поле на телефоне растёт вместе с ним.
  const [inputHeight, setInputHeight] = useState(0);

  const borderColor = error ? t.color.error : focused ? t.color.focus : t.color.borderStrong;
  const border = focused ? BORDER_FOCUS : BORDER;
  // Рамка в фокусе толще — отступы уменьшаются на ту же величину, чтобы текст не прыгал.
  const shift = border - BORDER;
  const message = error || hint;
  const labelStyle: TextStyle = {
    fontFamily: t.fontFamily.text[600],
    fontSize: t.type.caption.fontSize,
    lineHeight: LABEL_LINE,
    color: t.color.text,
  };

  return (
    <View style={{ gap: GAP, alignSelf: 'stretch' }}>
      {label ? <Text style={labelStyle}>{label}</Text> : null}
      {/* zIndex: улетающие куски текста проходят над подсказкой под полем. */}
      <View style={overlay ? { zIndex: 1 } : undefined}>
        <TextInput
          ref={inputRef}
          // Прятать текст цветом нельзя: на Android уже набранный текст цвет не меняет. Поэтому поле очищаем.
          value={overlay ? '' : value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onLayout={overlay ? undefined : (event) => setInputHeight(event.nativeEvent.layout.height)}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={t.color.textMuted}
          editable={!disabled && !overlay}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={KEYBOARD[type]}
          autoCapitalize={type === 'email' || type === 'url' ? 'none' : undefined}
          autoComplete={sensitive ? 'off' : undefined}
          importantForAutofill={sensitive ? 'no' : undefined}
          spellCheck={sensitive ? false : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={message}
          aria-disabled={!!disabled}
          aria-invalid={error ? true : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            {
              minHeight: Math.max(multiline ? rows * ROW_HEIGHT + ROWS_EXTRA : MIN_HEIGHT, overlay ? inputHeight : 0),
              paddingVertical: PAD_V - shift,
              paddingHorizontal: PAD_H - shift,
              borderRadius: t.radius.md,
              borderWidth: border,
              borderColor,
              backgroundColor: disabled ? t.color.surfaceAlt : t.color.surface,
              color: disabled ? t.color.textMuted : t.color.text,
              fontFamily: t.type.body.fontFamily,
              fontSize: t.type.body.fontSize,
              // Своя рамка фокуса вместо системной обводки браузера.
              outlineWidth: 0,
            },
            multiline && { lineHeight: t.type.body.lineHeight },
          ]}
        />
        {overlay ? (
          <View
            style={{
              position: 'absolute',
              top: BORDER + PAD_V,
              bottom: BORDER + PAD_V,
              left: BORDER + PAD_H,
              right: BORDER + PAD_H,
              pointerEvents: 'none',
            }}
          >
            {overlay}
          </View>
        ) : null}
      </View>
      {message ? (
        <Text
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={[t.type.caption, { color: error ? t.color.error : t.color.textMuted }]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
