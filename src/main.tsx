import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initI18n } from './i18n'
import './index.css'

// Carga el catálogo del idioma inicial (lazy, desde la caché del service worker
// si no hay red) antes del primer render: la app nace ya traducida.
void initI18n()
  .catch((err) => {
    console.error('i18n init failed', err);
  })
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
