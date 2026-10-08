import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { InfoNote, LikesTotal, WeekLikesBars } from '@/components/blocks';
import { addDays, dayAndMonth, dayDotMonth, toDateKey, weekdayIndex } from '@/lib/dates';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { CabinetFallback, likesThisWeek, useCabinet } from './Cabinet';

/** «Статистика» (эталон CabStats): всего откликов, за неделю и столбики по неделям. Только числа. */
export function CabinetStatsScreen() {
  const t = useTheme();
  const { cabinet } = useCabinet();
  if (!cabinet) return <CabinetFallback />;
  const { total, weeks } = cabinet.stats;

  // Сервер считает недели с понедельника; подписи — понедельники тех же недель по календарю телефона.
  const today = toDateKey(new Date());
  const monday = addDays(today, -weekdayIndex(today));
  const starts = weeks.map((_, i) => addDays(monday, -7 * (weeks.length - 1 - i)));
  const period = `${weeks.length} ${plural(weeks.length, 'неделя', 'недели', 'недель')}`;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.screen, paddingBottom: t.space.xl, gap: t.space.md }}>
      <Text accessibilityRole="header" style={[t.type.h1, { paddingTop: t.space.xs, color: t.color.text }]}>
        Статистика
      </Text>
      <LikesTotal
        count={total}
        label={`${plural(total, 'отклик', 'отклика', 'откликов')} «Нравится» за всё время`}
        badge={likesThisWeek(weeks)}
      />
      {weeks.length > 0 ? (
        <WeekLikesBars
          title="По неделям"
          caption={period}
          weeks={weeks.map((count, i) => ({ label: dayDotMonth(starts[i]), count }))}
          accessibilityLabel={`Отклики по неделям с ${dayAndMonth(starts[0])} по ${dayAndMonth(monday)}: ${weeks.join(', ')}`}
        />
      ) : null}
      <View>
        {/* В макете — «…ни вам, ни администратору», но администратор базы строки видит (docs/08): обещаем только правду. */}
        <InfoNote
          icon="heart"
          text="Мы показываем только количество. Кто именно отметил вас, не видно ни вам, ни другим пользователям."
        />
      </View>
    </ScrollView>
  );
}
