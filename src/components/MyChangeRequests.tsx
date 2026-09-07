import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import { WorkerChangeRequest } from "../types";
import { formatToLocalTime, formatToLocalTimeShort } from "../utils/dateFormatters";

interface MyChangeRequestsProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
  onNewRequest?: () => void;
}

const statusBadgeClass: Record<WorkerChangeRequest["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function formatDateDMY(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const MyChangeRequests: React.FC<MyChangeRequestsProps> = ({
  onBack,
  userEmail,
  userPassword,
  onNewRequest,
}) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<WorkerChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabel: Record<WorkerChangeRequest["status"], string> = {
    pending: t("changeRequests.list.status.pending"),
    accepted: t("changeRequests.list.status.accepted"),
    rejected: t("changeRequests.list.status.rejected"),
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWorkerChangeRequests(userEmail, userPassword);
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setRequests(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("changeRequests.list.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [userEmail, userPassword, t]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

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
          {t("common.backToMenu")}
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
          {t("changeRequests.list.new")}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {t("changeRequests.list.title")}
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
                onClick={loadRequests}
                className="ml-auto text-red-700 underline text-xs flex-shrink-0"
              >
                {t("common.retry")}
              </button>
            </div>
          )}

          {!loading && !error && requests.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              {t("changeRequests.list.empty")}
            </p>
          )}

          {!loading && !error && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateDMY(req.date)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {req.original_type === "entry"
                            ? t("timeRecord.recordType.entry")
                            : t("timeRecord.recordType.exit")}
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatToLocalTimeShort(req.original_timestamp)}
                          {" → "}
                          {formatToLocalTimeShort(req.new_timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {req.company_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t("changeRequests.list.sentOn", {
                          datetime: formatToLocalTime(req.created_at, {
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusBadgeClass[req.status]}`}
                    >
                      {statusLabel[req.status]}
                    </span>
                  </div>

                  {req.status === "rejected" && req.admin_public_comment && (
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
                        {req.admin_public_comment}
                      </p>
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

export default MyChangeRequests;
