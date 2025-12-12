import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

interface UserData {
  email: string;
  password: string;
  workerName: string;
}

function MainApp() {
  const appName = import.meta.env.VITE_APP_NAME || 'Time Tracking';
  const appLogo = import.meta.env.VITE_APP_LOGO || '';
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (email: string, password: string, workerName: string) => {
    setUser({ email, password, workerName });
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

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
