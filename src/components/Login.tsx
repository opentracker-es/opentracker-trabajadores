import React, { useState } from "react";
import { authService } from "../services/auth";

interface LoginProps {
  onLogin: (email: string, password: string, workerName: string) => void;
  onForgotPassword: () => void;
  appName: string;
  appLogo?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onForgotPassword, appName, appLogo }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate credentials against the API
      await authService.validateWorker({
        email: formData.email,
        password: formData.password,
      });

      // Extract worker name from email
      const name = formData.email.split('@')[0].replace(/[._]/g, ' ');

      // Login successful - call onLogin with validated credentials
      onLogin(formData.email, formData.password, name);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        {appLogo && (
          <img
            className="mx-auto h-16 w-auto mb-4"
            src={appLogo}
            alt={appName}
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900">{appName}</h1>
        <p className="mt-2 text-sm text-gray-600">Registro de jornada laboral</p>
      </div>

      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Iniciar sesión
          </h2>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              id="email"
              type="email"
              name="email"
              placeholder="trabajador@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              id="password"
              type="password"
              name="password"
              placeholder="******************"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
