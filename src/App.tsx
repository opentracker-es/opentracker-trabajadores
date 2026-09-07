import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AccessDenied from './components/AccessDenied';
import apiService from './services/api';
import { applyProfileLanguage } from './i18n/language';
import { unlockSessionLanguage } from './i18n/sessionLanguage';
import { onSubscriptionBlocked } from './services/errors';

interface UserData {
  email: string;
  password: string;
  workerName: string;
}

function MainApp() {
  const appName = import.meta.env.VITE_APP_NAME || 'Time Tracking';
  const appLogo = import.meta.env.VITE_APP_LOGO || '';
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Set document title with app name (re-runs when the UI language changes)
  useEffect(() => {
    document.title = t('app.documentTitle', { appName });
  }, [t, appName, i18n.language]);

  const [user, setUser] = useState<UserData | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);

  // Bloqueo de suscripción: cubre ambos caminos (login vía fetch y acciones vía axios).
  useEffect(() => {
    return onSubscriptionBlocked(() => setSubscriptionBlocked(true));
  }, []);

  const handleLogin = (email: string, password: string, workerName: string) => {
    setUser({ email, password, workerName });
    navigate('/');

    // Inicialización del idioma tras login (tarea 8.2): cadena
    // worker.language ?? empresa.notification_language ?? navegador ?? es.
    // En frío se arranca con el espejo de localStorage; el perfil corrige aquí.
    void (async () => {
      try {
        const profile = await apiService.getWorkerProfile(email, password);
        await applyProfileLanguage(profile);
      } catch {
        // Sin perfil (offline, credenciales caducadas...): se mantiene el
        // idioma ya resuelto en el arranque (localStorage/navegador/es).
      }
    })();
  };

  const handleLogout = () => {
    // Only the session language lock is cleared; the device hint stays so a
    // fresh cold start keeps the same semantics (login selector behaviour).
    unlockSessionLanguage();
    setUser(null);
    navigate('/');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  if (subscriptionBlocked) {
    return <AccessDenied appName={appName} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Dashboard
              userData={user}
              appName={appName}
              onLogout={handleLogout}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onForgotPassword={handleForgotPassword}
              appName={appName}
              appLogo={appLogo}
            />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPassword
            onBack={handleBackToLogin}
            appName={appName}
            appLogo={appLogo}
          />
        }
      />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword appName={appName} appLogo={appLogo} />}
      />
    </Routes>
  );
}

function App() {
  const basePath = import.meta.env.VITE_BASE_PATH || '/';

  return (
    <BrowserRouter basename={basePath}>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;
