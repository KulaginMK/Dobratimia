import Constants from 'expo-constants';

/** Версия из app.json. «1.0.0» → «1.0»: нулевой номер исправления не показываем, как в макетах. */
export const APP_VERSION = (Constants.expoConfig?.version ?? '').replace(/^(\d+\.\d+)\.0$/, '$1');
