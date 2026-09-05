import i18n from '../i18n';
import { getApiErrorMessage } from './errorMessages';
import {
  SubscriptionBlockedError,
  emitSubscriptionBlocked,
} from './errors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface WorkerLoginCredentials {
  email: string;
  password: string;
}

export interface WorkerCompany {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  /** Idioma de notificaciones de la empresa (fuente de herencia del locale UI). */
  notification_language?: string;
}

export const authService = {
  /**
   * Valida las credenciales del trabajador contra la API.
   * Usa el endpoint /workers/my-companies que valida email + password
   * y retorna las empresas asociadas al trabajador.
   *
   * @param credentials - Email y contraseña del trabajador
   * @returns Array de empresas asociadas al trabajador
   * @throws Error si las credenciales son inválidas o hay problema de conexión
   */
  async validateWorker(credentials: WorkerLoginCredentials): Promise<WorkerCompany[]> {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/workers/my-companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    } catch {
      // Error de red o conexión
      throw new Error(i18n.t('errors.network.generic'));
    }

    if (!response.ok) {
      // El cuerpo puede traer `detail` objeto ({ error_code, message }) o string plano.
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        /* cuerpo no-JSON */
      }
      const detail = (body as { detail?: unknown } | undefined)?.detail;

      // Suscripción de la empresa inactiva (gate 402 subscription_inactive)
      if (response.status === 402 || detail === 'subscription_inactive') {
        emitSubscriptionBlocked();
        throw new SubscriptionBlockedError();
      }

      throw new Error(
        getApiErrorMessage({
          isAxiosError: true,
          response: { status: response.status, data: { detail } },
        }),
      );
    }

    const companies = await response.json();
    return companies;
  },
};
