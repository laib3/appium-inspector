import React, {Suspense} from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import i18n from './configs/i18next.renderer';
import Spinner from './components/Spinner/Spinner.jsx';
import InspectorPage from './containers/InspectorPage';
import SessionPage from './containers/SessionPage';
import {ipcRenderer} from './shared/polyfills';

ipcRenderer.on('appium-language-changed', (event, message) => {
  if (i18n.language !== message.language) {
    i18n.changeLanguage(message.language);
  }
});

const Root = ({store}) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={['/']}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<SessionPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/inspector" element={<InspectorPage />} />
        </Routes>
      </Suspense>
    </MemoryRouter>
  </Provider>
);

export default Root;
