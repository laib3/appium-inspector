import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import {i18NextBackend, i18NextBackendOptions} from '../renderer/src/polyfills';
import {getI18NextOptions} from './app.config';

const i18nextOptions = getI18NextOptions(i18NextBackendOptions);

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).use(i18NextBackend).init(i18nextOptions);
}

export default i18n;
