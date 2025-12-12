import axios, { AxiosError } from "axios";
import {
  TimeRecordCredentials,
  TimeRecordResponse,
  TokenResponse,
  ApiError,
  IncidentCredentials,
  IncidentResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  Company,
  PauseType,
  WorkerCurrentStatus,
  ChangeRequestCreate,
  ChangeRequest,
  PendingCheckResponse,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_USERNAME = import.meta.env.VITE_API_USERNAME;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

class ApiService {
  private token: string | null = null;
  private authenticationFailed: boolean = false;

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry if:
        // 1. This is already a retry
        // 2. The failed request was to the token endpoint
        // 3. We've already failed to authenticate
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/token") &&
          !this.authenticationFailed
        ) {
          originalRequest._retry = true;

          try {
            await this.authenticate();
            originalRequest.headers.Authorization = `Bearer ${this.token}`;
            return axios(originalRequest);
          } catch (authError) {
            // Mark authentication as failed to prevent future retries
            this.authenticationFailed = true;
            return Promise.reject(authError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async authenticate(): Promise<void> {
    if (!API_USERNAME || !API_PASSWORD) {
      throw new Error("API credentials not configured. Please check your .env file.");
    }

    try {
      const formData = new FormData();
      formData.append("username", API_USERNAME);
      formData.append("password", API_PASSWORD);

      const response = await axios.post<TokenResponse>(
        `${API_URL}/api/token`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      this.token = response.data.access_token;
      this.authenticationFailed = false; // Reset the flag on successful auth
    } catch (error) {
      this.authenticationFailed = true;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.status === 401) {
          throw new Error(
            "API authentication failed. Please check VITE_API_USERNAME and VITE_API_PASSWORD in your .env file.",
          );
        }

        if (axiosError.response?.data?.detail) {
          throw new Error(
            `API authentication failed: ${axiosError.response.data.detail}`,
          );
        }
      }

      throw new Error(
        "Failed to authenticate with API. Please check your configuration.",
      );
    }
  }

  async createTimeRecord(
    credentials: TimeRecordCredentials,
  ): Promise<TimeRecordResponse> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<TimeRecordResponse>(
        `${API_URL}/api/time-records/`,
        {
          ...credentials,
          timezone: timezone,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.status === 401 && this.authenticationFailed) {
          throw new Error(
            "Unable to connect to API. Please contact the administrator.",
          );
        }

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 400:
            throw new Error("Bad request. Please check your input.");
          case 401:
            throw new Error("Invalid worker credentials.");
          case 404:
            throw new Error("Worker not found.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error("An unexpected error occurred.");
        }
      }
      throw error;
    }
  }

  async createIncident(
    credentials: IncidentCredentials,
  ): Promise<IncidentResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<IncidentResponse>(
        `${API_URL}/api/incidents/`,
        credentials,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.status === 401 && this.authenticationFailed) {
          throw new Error(
            "Unable to connect to API. Please contact the administrator.",
          );
        }

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 400:
            throw new Error("Bad request. Please check your input.");
          case 401:
            throw new Error("Invalid worker credentials.");
          case 404:
            throw new Error("Worker not found.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error("An unexpected error occurred.");
        }
      }
      throw error;
    }
  }

  async changePassword(
    request: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.patch<ChangePasswordResponse>(
        `${API_URL}/api/workers/change-password`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 400:
            throw new Error("La nueva contraseña no es válida.");
          case 401:
            throw new Error("Contraseña actual incorrecta.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error inesperado al cambiar la contraseña.");
        }
      }
      throw error;
    }
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<ForgotPasswordResponse>(
        `${API_URL}/api/workers/forgot-password`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 429:
            throw new Error("Demasiados intentos. Por favor, espera una hora.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al procesar la solicitud.");
        }
      }
      throw error;
    }
  }

  async resetPassword(
    request: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<ResetPasswordResponse>(
        `${API_URL}/api/workers/reset-password`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 400:
            throw new Error("El enlace de recuperación es inválido o ha expirado.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al restablecer la contraseña.");
        }
      }
      throw error;
    }
  }

  async getWorkerCompanies(email: string, password: string): Promise<Company[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<Company[]>(
        `${API_URL}/api/workers/my-companies`,
        {
          email,
          password,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 401:
            throw new Error("Credenciales inválidas.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al cargar las empresas.");
        }
      }
      throw error;
    }
  }

  async getAvailablePauseTypes(email: string, password: string, company_id: string): Promise<PauseType[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<PauseType[]>(
        `${API_URL}/api/pause-types/available`,
        {
          email,
          password,
          company_id,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 401:
            throw new Error("Credenciales inválidas.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al cargar los tipos de pausa.");
        }
      }
      throw error;
    }
  }

  async getCurrentStatus(email: string, password: string, company_id: string): Promise<WorkerCurrentStatus> {
    if (!this.token) {
      await this.authenticate();
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const response = await axios.post<WorkerCurrentStatus>(
        `${API_URL}/api/time-records/current-status`,
        {
          email,
          password,
          company_id,
          timezone,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 401:
            throw new Error("Credenciales inválidas.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al cargar el estado actual.");
        }
      }
      throw error;
    }
  }

  async checkPendingChangeRequest(
    email: string,
    password: string,
  ): Promise<PendingCheckResponse> {
    try {
      const response = await axios.post<PendingCheckResponse>(
        `${API_URL}/api/change-requests/pending/check`,
        { email, password },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 401:
            throw new Error("Credenciales inválidas.");
          case 404:
            throw new Error("Trabajador no encontrado.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al verificar peticiones pendientes.");
        }
      }
      throw error;
    }
  }

  async createChangeRequest(
    request: ChangeRequestCreate,
  ): Promise<ChangeRequest> {
    try {
      const response = await axios.post<ChangeRequest>(
        `${API_URL}/api/change-requests/`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 400:
            throw new Error("Datos inválidos. Por favor verifica tu entrada.");
          case 401:
            throw new Error("Credenciales inválidas.");
          case 404:
            throw new Error("Registro no encontrado o no pertenece a este trabajador.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al crear la petición de cambio.");
        }
      }
      throw error;
    }
  }

  async getWorkerDayRecords(
    email: string,
    password: string,
    date: string,
    company_id: string,
  ): Promise<TimeRecordResponse[]> {
    try {
      const response = await axios.post<TimeRecordResponse[]>(
        `${API_URL}/api/time-records/worker/history`,
        {
          email,
          password,
          company_id,
          start_date: date,
          end_date: date,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }

        switch (axiosError.response?.status) {
          case 401:
            throw new Error("Credenciales inválidas.");
          case 404:
            throw new Error("Trabajador o empresa no encontrados.");
          case 500:
            throw new Error("Error del servidor. Inténtalo de nuevo.");
          default:
            throw new Error("Error al cargar los registros del día.");
        }
      }
      throw error;
    }
  }

  resetAuthentication(): void {
    this.token = null;
    this.authenticationFailed = false;
  }
}

export default new ApiService();
