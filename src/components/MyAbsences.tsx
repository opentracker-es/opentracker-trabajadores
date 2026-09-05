import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import { WorkerAbsence, AbsenceStatus } from "../types";
import { formatToLocalTime } from "../utils/dateFormatters";

interface MyAbsencesProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
  companyId: string;
  onNewRequest?: () => void;
}

const statusBadgeClass: Record<AbsenceStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

function formatDateDMY(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatRange(start: string, end: string): string {
  return start === end ? formatDateDMY(start) : `${formatDateDMY(start)} → ${formatDateDMY(end)}`;
}

const MyAbsences: React.FC<MyAbsencesProps> = ({
  onBack,
  userEmail,
  userPassword,
  companyId,
  onNewRequest,
}) => {
  const { t } = useTranslation();
  const [absences, setAbsences] = useState<WorkerAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const statusLabel: Record<AbsenceStatus, string> = {
    pending: t("absences.status.pending"),
    accepted: t("absences.status.accepted"),
    rejected: t("absences.status.rejected"),
    cancelled: t("absences.status.cancelled"),
  };

  const dayPortionLabel: Record<string, string> = {
    full: t("absences.portion.full"),
    morning: t("absences.portion.morning"),
    afternoon: t("absences.portion.afternoon"),
  };

  const loadAbsences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWorkerAbsences(userEmail, userPassword, {
        company_id: companyId,
      });
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAbsences(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("absences.list.loadError"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userPassword, companyId]);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    setError(null);
    try {
      await apiService.cancelAbsence(id, userEmail, userPassword);
      await loadAbsences();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("absences.list.cancelError"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("common.back")}
        </button>

        <button
          onClick={onNewRequest ?? onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("absences.list.new")}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t("absences.list.title")}
          </h3>
        </div>

        <div className="px-6 py-6">
          {loading && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("common.loading")}
            </div>
          )}

          {error && (
            <div
              className="p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 flex items-start"
              role="alert"
            >
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
              <button
                onClick={loadAbsences}
                className="ml-auto text-red-700 underline text-xs flex-shrink-0"
              >
                {t("common.retry")}
              </button>
            </div>
          )}

          {!loading && !error && absences.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              {t("absences.list.empty")}
            </p>
          )}

          {!loading && !error && absences.length > 0 && (
            <div className="space-y-3">
              {absences.map((abs) => (
                <div
                  key={abs.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {abs.absence_type_name}
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatRange(abs.start_date, abs.end_date)}
                        </span>
                        {abs.is_partial && (
                          <span className="text-xs text-gray-500">
                            ({dayPortionLabel[abs.day_portion] ?? abs.day_portion})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("absences.list.days", { count: abs.days_computed })}
                        {" · "}
                        {abs.company_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t("absences.list.sentOn", {
                          datetime: formatToLocalTime(abs.created_at, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusBadgeClass[abs.status]}`}
                    >
                      {statusLabel[abs.status]}
                    </span>
                  </div>

                  {abs.admin_public_comment && (
                    <div className="mt-3 ml-4 pl-3 border-l-2 border-gray-200 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs text-gray-500">
                        {abs.admin_public_comment}
                      </p>
                    </div>
                  )}

                  {abs.status === "pending" && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleCancel(abs.id)}
                        disabled={cancellingId === abs.id}
                        className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === abs.id
                          ? t("absences.list.cancelling")
                          : t("absences.list.cancelRequest")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAbsences;
