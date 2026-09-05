import { useTranslation } from 'react-i18next';

interface AccessDeniedProps {
  appName?: string;
}

/**
 * Pantalla completa mostrada cuando la suscripción de la empresa está inactiva
 * (respuesta 402 `subscription_inactive` de la API). Sustituye a Login/Dashboard.
 */
function AccessDenied({ appName }: AccessDeniedProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      {appName && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{appName}</h1>
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('accessDenied.title')}
          </h2>
          <p className="text-gray-600">{t('accessDenied.message')}</p>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
