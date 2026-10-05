-- Удаляет вымышленные данные, добавленные demo.sql. Отметки «Нравится» и сердечки к ним удаляются следом.
delete from public.phrases where id in (
  'd0000000-0000-4000-8000-000000000201', 'd0000000-0000-4000-8000-000000000202',
  'd0000000-0000-4000-8000-000000000203', 'd0000000-0000-4000-8000-000000000204',
  'd0000000-0000-4000-8000-000000000205', 'd0000000-0000-4000-8000-000000000206'
);
delete from public.specialists where id in (
  'd0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000004'
);
delete from public.university_staff where id in (
  'd0000000-0000-4000-8000-000000000101', 'd0000000-0000-4000-8000-000000000102'
);
update public.universities set
  service_name = null, service_address = null, service_hours = null, service_phone = null, verified_at = null
where id = 'vsmu' and service_phone = '+375 212 00-00-00';
