// Дополняет app.json тем, что зависит от места сборки. Всё остальное по-прежнему в app.json.
module.exports = ({ config }) => {
  // На сборочных серверах (EAS, GitHub) файла .env.local нет. Без адреса сервера приложение молча
  // собралось бы на заглушках: с вымышленными специалистами и входом-имитацией.
  const onBuildServer = process.env.CI || process.env.EAS_BUILD;
  if (onBuildServer && !(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Не заданы EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY — см. PUBLISH.md.');
  }
  // Подпапка сайта на GitHub Pages нужна только веб-сборке: записанная в app.json, она попадала
  // и в сборку для Android. Задаёт её .github/workflows/deploy.yml по имени репозитория.
  const baseUrl = process.env.WEB_BASE_URL;
  const withBaseUrl = baseUrl ? { ...config, experiments: { ...config.experiments, baseUrl } } : config;
  // Файл Firebase для push не лежит в открытом репозитории: в сборке EAS он приходит переменной GOOGLE_SERVICES_JSON
  // (тип «файл»). Без неё приложение собирается и работает, только без push (supabase/README.md).
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  return googleServicesFile
    ? { ...withBaseUrl, android: { ...withBaseUrl.android, googleServicesFile } }
    : withBaseUrl;
};
