// Дополняет app.json тем, что зависит от места сборки. Всё остальное по-прежнему в app.json.
module.exports = ({ config }) => {
  // На сборочных серверах (EAS, GitHub) файла .env.local нет. Без адреса сервера приложение молча
  // собралось бы на заглушках: с вымышленными специалистами и входом-имитацией.
  if (process.env.CI && !(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Не заданы EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY — см. PUBLISH.md.');
  }
  // Подпапка сайта на GitHub Pages нужна только веб-сборке: записанная в app.json, она попадала
  // и в сборку для Android. Задаёт её .github/workflows/deploy.yml по имени репозитория.
  const baseUrl = process.env.WEB_BASE_URL;
  return baseUrl ? { ...config, experiments: { ...config.experiments, baseUrl } } : config;
};
