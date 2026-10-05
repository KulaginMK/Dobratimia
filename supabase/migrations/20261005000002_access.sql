-- Правила доступа (handoff/docs/08-data-and-backend.md, «Правила доступа (RLS)»).
-- Порядок везде один: включить RLS, забрать у ролей приложения все права, выдать только нужные.
-- anon — человек без входа, authenticated — вошедший. Администратор в первой версии работает
-- в Supabase Studio (там правила доступа не действуют), поэтому прав на запись через приложение у него нет.

-- Помощники для правил. security definer: читают служебные таблицы в обход RLS,
-- но наружу отдают только «да/нет» или id собственной карточки.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create function public.my_specialist_id() returns uuid
language sql stable security definer set search_path = ''
as $$
  select specialist_id from public.specialist_accounts where user_id = (select auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.my_specialist_id() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_specialist_id() to authenticated;

-- Вузы и сотрудники служб: читают все, в том числе без входа (SOS).
alter table public.universities enable row level security;
revoke all on table public.universities from anon, authenticated;
grant select on table public.universities to anon, authenticated;
create policy universities_read on public.universities for select to anon, authenticated using (true);

alter table public.university_staff enable row level security;
revoke all on table public.university_staff from anon, authenticated;
grant select on table public.university_staff to anon, authenticated;
create policy university_staff_read on public.university_staff for select to anon, authenticated using (true);

-- Профиль: человек читает свою строку и меняет в ней только имя и вуз. Роль меняет администратор в Studio.
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, university_id) on table public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Карточки специалистов: вошедшие видят опубликованные; специалист — ещё и свою, даже неопубликованную.
alter table public.specialists enable row level security;
revoke all on table public.specialists from anon, authenticated;
grant select on table public.specialists to authenticated;
create policy specialists_read on public.specialists for select to authenticated
  using (published or id = public.my_specialist_id() or public.is_admin());

-- Связь с аккаунтом (здесь почта специалиста): специалист видит только свою строку.
alter table public.specialist_accounts enable row level security;
revoke all on table public.specialist_accounts from anon, authenticated;
grant select on table public.specialist_accounts to authenticated;
create policy specialist_accounts_read on public.specialist_accounts for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Контакты: только тому, кто отметил специалиста «Нравится», и только если специалист согласился
-- на публикацию и его карточка опубликована. Сам специалист свои контакты видит всегда.
alter table public.specialist_contacts enable row level security;
revoke all on table public.specialist_contacts from anon, authenticated;
grant select on table public.specialist_contacts to authenticated;
create policy specialist_contacts_read on public.specialist_contacts for select to authenticated
  using (
    (
      consent
      and exists (
        select 1 from public.likes l
        where l.user_id = (select auth.uid()) and l.specialist_id = specialist_contacts.specialist_id
      )
      and exists (
        select 1 from public.specialists s
        where s.id = specialist_contacts.specialist_id and s.published
      )
    )
    or specialist_id = public.my_specialist_id()
    or public.is_admin()
  );

-- Черновики: специалист читает свой. Пишет только через submit_draft(), одобряет администратор через approve_draft().
alter table public.specialist_drafts enable row level security;
revoke all on table public.specialist_drafts from anon, authenticated;
grant select on table public.specialist_drafts to authenticated;
create policy specialist_drafts_read on public.specialist_drafts for select to authenticated
  using (specialist_id = public.my_specialist_id() or public.is_admin());

-- Отметки «Нравится»: человек видит, ставит и снимает только свои. Изменить отметку нельзя — только снять.
-- Специалист строк не читает: число отдаёт specialist_like_stats().
alter table public.likes enable row level security;
revoke all on table public.likes from anon, authenticated;
grant select, insert, delete on table public.likes to authenticated;
create policy likes_read_own on public.likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy likes_insert_own on public.likes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.specialists s where s.id = likes.specialist_id and s.published)
  );
create policy likes_delete_own on public.likes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Фразы: вошедшие читают опубликованные.
alter table public.phrases enable row level security;
revoke all on table public.phrases from anon, authenticated;
grant select on table public.phrases to authenticated;
create policy phrases_read on public.phrases for select to authenticated
  using (published or public.is_admin());

-- Сердечки фразам: человек видит, ставит и снимает только свои.
alter table public.phrase_likes enable row level security;
revoke all on table public.phrase_likes from anon, authenticated;
grant select, insert, delete on table public.phrase_likes to authenticated;
create policy phrase_likes_read_own on public.phrase_likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy phrase_likes_insert_own on public.phrase_likes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.phrases p where p.id = phrase_likes.phrase_id and p.published)
  );
create policy phrase_likes_delete_own on public.phrase_likes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Число сердечек у каждой фразы — для команды, смотреть в Supabase Studio. Приложению недоступно.
create view public.phrase_like_stats with (security_invoker = true) as
  select p.id, p.tone, p.text, p.published, count(pl.user_id) as likes
  from public.phrases p
  left join public.phrase_likes pl on pl.phrase_id = p.id
  group by p.id
  order by likes desc, p.created_at;
revoke all on table public.phrase_like_stats from anon, authenticated;

-- «Был сегодня»: напрямую таблица недоступна никому, только через mark_presence() и today_count().
alter table public.daily_presence enable row level security;
revoke all on table public.daily_presence from anon, authenticated;
