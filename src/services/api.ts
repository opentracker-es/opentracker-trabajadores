import axios from "axios";
import i18n from "../i18n";
import { emitSubscriptionBlocked } from "./errors";
import { getApiErrorMessage } from "./errorMessages";
import {
  TimeRecordCredentials,
  TimeRecordResponse,
  TokenResponse,
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
  MonthlyReportRequest,
  MonthlyReportResponse,
  MonthlySignatureRequest,
  MonthlySignatureResponse,
  SignatureStatusResponse,
  WorkerChangeRequest,
  AbsenceRequestCreate,
  WorkerAbsence,
  AbsenceBalance,
  TeamCalendarEntry,
  AttachmentUploadResponse,
  AbsenceTypeOption,
  WorkerProfileResponse,
  WorkerLanguageResponse,
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

        // Suscripción de la empresa inactiva (gate 402 subscription_inactive):
        // cubre cualquier acción posterior al login (el login usa fetch, no axios).
        if (
          error.response?.status === 402 ||
          error.response?.data?.detail === "subscription_inactive"
        ) {
          emitSubscriptionBlocked();
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
        if (error.response?.status === 401) {
          throw new Error(
            "API authentication failed. Please check VITE_API_USERNAME and VITE_API_PASSWORD in your .env file.",
          );
        }
      }

      throw new Error(
        "Failed to authenticate with API. Please check your configuration.",
      );
    }
  }

  /**
   * Every API method funnels failures through here: `getApiErrorMessage`
   * applies the error_code -> catalog -> detail.message -> plain detail ->
   * status/network generic chain (task 9.2).
   */
  private apiError(error: unknown): Error {
    return new Error(getApiErrorMessage(error));
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
      if (axios.isAxiosError(error) && error.response?.status === 401 && this.authenticationFailed) {
        // API tenant credentials failed: message for the worker's admin contact.
        throw new Error(i18n.t("errors.network.admin"));
      }
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
    }
  }

  /**
   * Perfil del propio trabajador (incluye `language` y `notification_language`
   * para resolver el idioma de la UI — ver `src/i18n/language.ts`).
   */
  async getWorkerProfile(
    email: string,
    password: string,
  ): Promise<WorkerProfileResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<WorkerProfileResponse>(
        `${API_URL}/api/workers/me`,
        { email, password },
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  /**
   * Autoservicio de idioma del trabajador (`PATCH /api/workers/language`).
   * Autentica con email + contraseña (sin JWT, igual que change-password).
   * `language = null` restablece la preferencia ("Automático").
   */
  async updateWorkerLanguage(
    email: string,
    password: string,
    language: string | null,
  ): Promise<WorkerLanguageResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.patch<WorkerLanguageResponse>(
        `${API_URL}/api/workers/language`,
        { email, password, language },
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
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
      throw this.apiError(error);
    }
  }

  async getMonthlyReport(
    request: MonthlyReportRequest,
  ): Promise<MonthlyReportResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<MonthlyReportResponse>(
        `${API_URL}/api/reports/worker/monthly`,
        request,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async signMonthlyReport(
    request: MonthlySignatureRequest,
  ): Promise<MonthlySignatureResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<MonthlySignatureResponse>(
        `${API_URL}/api/reports/worker/monthly/sign`,
        request,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async getSignatureStatus(
    request: MonthlyReportRequest,
  ): Promise<SignatureStatusResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<SignatureStatusResponse>(
        `${API_URL}/api/reports/worker/signatures/status`,
        request,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async getWorkerChangeRequests(
    email: string,
    password: string,
    options?: { company_id?: string; status_filter?: string; limit?: number },
  ): Promise<WorkerChangeRequest[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const body: Record<string, unknown> = { email, password };
      if (options?.company_id !== undefined) body.company_id = options.company_id;
      if (options?.status_filter !== undefined) body.status_filter = options.status_filter;
      if (options?.limit !== undefined) body.limit = options.limit;

      const response = await axios.post<WorkerChangeRequest[]>(
        `${API_URL}/api/change-requests/worker/history`,
        body,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Ausencias y vacaciones (portal del trabajador)
  // ---------------------------------------------------------------------------

  async uploadAttachment(
    email: string,
    password: string,
    company_id: string,
    file: File,
  ): Promise<AttachmentUploadResponse> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("company_id", company_id);
      formData.append("file", file);

      const response = await axios.post<AttachmentUploadResponse>(
        `${API_URL}/api/absences/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async createAbsenceRequest(
    request: AbsenceRequestCreate,
  ): Promise<WorkerAbsence> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<WorkerAbsence>(
        `${API_URL}/api/absences/`,
        request,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async getWorkerAbsences(
    email: string,
    password: string,
    options?: { company_id?: string; status_filter?: string; limit?: number },
  ): Promise<WorkerAbsence[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const body: Record<string, unknown> = { email, password };
      if (options?.company_id !== undefined) body.company_id = options.company_id;
      if (options?.status_filter !== undefined) body.status_filter = options.status_filter;
      if (options?.limit !== undefined) body.limit = options.limit;

      const response = await axios.post<WorkerAbsence[]>(
        `${API_URL}/api/absences/me`,
        body,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async getWorkerBalance(
    email: string,
    password: string,
    company_id: string,
    year?: number,
  ): Promise<AbsenceBalance> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const body: Record<string, unknown> = { email, password, company_id };
      if (year !== undefined) body.year = year;

      const response = await axios.post<AbsenceBalance>(
        `${API_URL}/api/absences/me/balance`,
        body,
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async cancelAbsence(
    absenceId: string,
    email: string,
    password: string,
  ): Promise<WorkerAbsence> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<WorkerAbsence>(
        `${API_URL}/api/absences/me/${absenceId}/cancel`,
        { email, password },
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async getTeamCalendar(
    email: string,
    password: string,
    company_id: string,
    start_date: string,
    end_date: string,
  ): Promise<TeamCalendarEntry[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<TeamCalendarEntry[]>(
        `${API_URL}/api/absences/me/calendar`,
        { email, password, company_id, start_date, end_date },
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  async getAbsenceTypes(
    email: string,
    password: string,
    company_id: string,
  ): Promise<AbsenceTypeOption[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post<AbsenceTypeOption[]>(
        `${API_URL}/api/absences/me/types`,
        { email, password, company_id },
      );
      return response.data;
    } catch (error) {
      throw this.apiError(error);
    }
  }

  resetAuthentication(): void {
    this.token = null;
    this.authenticationFailed = false;
  }
}

export default new ApiService();
