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
    try {
      const response = await fetch(`${API_URL}/api/workers/my-companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Email o contraseña incorrectos');
        }
        if (response.status === 500) {
          throw new Error('Error del servidor. Por favor, inténtalo de nuevo más tarde.');
        }
        throw new Error('Error al validar credenciales. Por favor, inténtalo de nuevo.');
      }

      const companies = await response.json();
      return companies;

    } catch (err) {
      // Si es un error que ya lanzamos, lo propagamos
      if (err instanceof Error) {
        throw err;
      }
      // Error de red o conexión
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
  },
};
