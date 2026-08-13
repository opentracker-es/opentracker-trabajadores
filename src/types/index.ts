export interface TimeRecordCredentials {
  email: string;
  password: string;
  company_id: string;
  action?: 'entry' | 'exit' | 'pause_start' | 'pause_end';
  pause_type_id?: string;
}

export interface TimeRecordResponse {
  id: string;
  worker_id: string;
  record_type: 'entry' | 'exit' | 'pause_start' | 'pause_end';
  timestamp: string;  // UTC ISO 8601
  duration_minutes?: number;
  recorded_by: string;
  company_id?: string;
  company_name?: string;
  pause_type_id?: string;
  pause_type_name?: string;
  pause_counts_as_work?: boolean;
}

export interface PauseType {
  id: string;
  name: string;
  type: 'inside_shift' | 'outside_shift';
  description?: string;
}

export interface WorkerCurrentStatus {
  worker_id: string;
  worker_name: string;
  company_id: string;
  company_name: string;
  status: 'logged_out' | 'logged_in' | 'on_pause';
  entry_time?: string;
  time_worked_minutes?: number;
  pause_type_id?: string;
  pause_type_name?: string;
  pause_counts_as_work?: boolean;
  pause_started_at?: string;
  pause_duration_minutes?: number;
}

export interface ApiError {
  detail: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface IncidentCredentials {
  email: string;
  password: string;
  description: string;
}

export interface IncidentResponse {
  id: string;
  worker_id: string;
  worker_email: string;
  worker_name: string;
  worker_id_number: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  admin_notes?: string;
}

export interface ChangePasswordRequest {
  email: string;
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  // Opt-in del módulo de ausencias/vacaciones (gating de la sección en la webapp).
  absence_management_enabled?: boolean;
}

export interface ChangeRequestCreate {
  email: string;
  password: string;
  date: string; // YYYY-MM-DD
  company_id: string;
  time_record_id: string;
  new_timestamp: string; // ISO 8601 UTC
  reason: string;
}

export interface ChangeRequest {
  id: string;
  worker_id: string;
  worker_email: string;
  worker_name: string;
  worker_id_number: string;
  date: string;
  time_record_id: string;
  original_timestamp: string;
  original_created_at: string;
  original_type: 'entry' | 'exit';
  company_id: string;
  company_name: string;
  new_timestamp: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewed_by_admin_id?: string;
  reviewed_by_admin_email?: string;
  reviewed_at?: string;
  admin_public_comment?: string;
  validation_errors?: string[];
}

export interface PendingCheckResponse {
  has_pending: boolean;
  pending_request_id?: string;
}

// Monthly Reports (worker self-service)

export interface ModificationEntry {
  record_id: string;
  record_type: 'entry' | 'exit';
  original_timestamp: string;   // ISO datetime UTC
  new_timestamp: string;        // ISO datetime UTC
  modified_at: string;          // ISO datetime UTC
  modified_by_admin_email: string;
  modification_reason: string;
}

export interface MonthlyReportRequest {
  email: string;
  password: string;
  company_id: string;
  year: number;
  month: number;
}

export interface DaySummary {
  date: string;
  worker_id: string;
  worker_name: string;
  worker_id_number: string;
  company_id: string;
  company_name: string;
  first_entry: string | null;
  last_exit: string | null;
  total_worked_minutes: number;
  total_pause_minutes: number;
  total_break_minutes: number;
  records_count: number;
  has_open_session: boolean;
  is_modified: boolean;
  modifications?: ModificationEntry[];
}

export interface MonthlyReportResponse {
  worker_id: string;
  worker_name: string;
  worker_id_number: string;
  company_id: string;
  company_name: string;
  year: number;
  month: number;
  total_days_worked: number;
  total_worked_minutes: number;
  total_pause_minutes: number;
  total_overtime_minutes: number;
  daily_details: DaySummary[];
  signature_status: 'pending' | 'signed' | 'not_required';
  signed_at: string | null;
  generated_at: string;
}

// Monthly Signatures

export interface MonthlySignatureRequest {
  email: string;
  password: string;
  company_id: string;
  year: number;
  month: number;
}

export interface MonthlySignatureResponse {
  id: string;
  worker_id: string;
  company_id: string;
  year: number;
  month: number;
  status: 'signed';
  signed_at: string;
}

export interface SignatureMonth {
  year: number;
  month: number;
  status: 'pending' | 'signed';
  signed_at?: string;
}

export interface SignatureStatusResponse {
  pending: SignatureMonth[];
  signed: SignatureMonth[];
}

export interface WorkerChangeRequest {
  id: string;
  date: string;
  time_record_id: string;
  original_timestamp: string;
  original_type: 'entry' | 'exit';
  company_id: string;
  company_name: string;
  new_timestamp: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  admin_public_comment?: string;
}

// Ausencias y vacaciones (portal del trabajador)

export type AbsenceStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
export type DayPortion = 'full' | 'morning' | 'afternoon';

export interface AbsenceTypeOption {
  code: string;
  name: string;
  deducts_balance: boolean;
  requires_attachment: boolean;
  is_paid?: boolean;
  max_days?: number | null;
  color?: string;
}

/**
 * Catálogo por defecto de tipos de ausencia (solo FALLBACK).
 *
 * El catálogo real de la empresa se obtiene vía `POST /api/absences/me/types`
 * (`ApiService.getAbsenceTypes`). Estos valores por defecto coinciden con los
 * 5 tipos que la API siembra en cada política nueva y solo se usan como respaldo
 * si esa llamada falla, para no dejar el selector de tipo vacío.
 */
export const DEFAULT_ABSENCE_TYPES: AbsenceTypeOption[] = [
  { code: 'vacation', name: 'Vacaciones', requires_attachment: false, deducts_balance: true },
  { code: 'personal_matters', name: 'Asuntos propios', requires_attachment: false, deducts_balance: true },
  { code: 'paid_leave', name: 'Permiso retribuido', requires_attachment: true, deducts_balance: false },
  { code: 'justified_absence', name: 'Ausencia justificada', requires_attachment: true, deducts_balance: false },
  { code: 'unjustified_absence', name: 'Ausencia no justificada', requires_attachment: false, deducts_balance: false },
];

export interface AbsenceRequestCreate {
  email: string;
  password: string;
  company_id: string;
  absence_type_code: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_partial: boolean;
  day_portion: DayPortion;
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  worker_comment?: string;
  attachment_id?: string;
}

export interface WorkerAbsence {
  id: string;
  company_id: string;
  company_name: string;
  absence_type_code: string;
  absence_type_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_partial: boolean;
  day_portion: DayPortion;
  start_time?: string | null;
  end_time?: string | null;
  worker_comment?: string | null;
  attachment_id?: string | null;
  days_computed: number;
  status: AbsenceStatus;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  admin_public_comment?: string | null;
}

export interface AbsenceBalance {
  year: number;
  reference_year_mode: 'calendar' | 'hire_date';
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  total_days: number;
  taken_days: number;
  pending_days: number;
  available_days: number;
}

export interface TeamCalendarEntry {
  worker_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export interface AttachmentUploadResponse {
  attachment_id: string;
}
