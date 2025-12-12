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
