import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import { AbsenceBalance as AbsenceBalanceData } from "../types";

interface AbsenceBalanceProps {
  userEmail: string;
  userPassword: string;
  companyId: string;
  /** Cambiar este valor fuerza una recarga del saldo (p. ej. tras crear una solicitud). */
  refreshKey?: number;
}

const AbsenceBalance: React.FC<AbsenceBalanceProps> = ({
  userEmail,
  userPassword,
  companyId,
  refreshKey,
}) => {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<AbsenceBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWorkerBalance(userEmail, userPassword, companyId);
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("absences.balance.loadError"));
    } finally {
      setLoading(false);
    }
  }, [userEmail, userPassword, companyId, t]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance, refreshKey]);

  const stats: { key: string; label: string; value: number; className: string }[] = balance
    ? [
        { key: "total", label: t("absences.balance.total"), value: balance.total_days, className: "text-gray-900" },
        { key: "taken", label: t("absences.balance.taken"), value: balance.taken_days, className: "text-green-700" },
        { key: "pending", label: t("absences.balance.pending"), value: balance.pending_days, className: "text-yellow-700" },
        { key: "available", label: t("absences.balance.available"), value: balance.available_days, className: "text-blue-700" },
      ]
    : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {t("absences.balance.title")}
          {balance && (
            <span className="ml-2 text-sm font-normal text-gray-500">({balance.year})</span>
          )}
        </h3>
        {!loading && (
          <button
            onClick={loadBalance}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={t("absences.balance.refresh")}
            aria-label={t("absences.balance.refresh")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-6 text-gray-500">
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

        {error && !loading && (
          <div
            className="p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 flex items-start"
            role="alert"
          >
            <span>{error}</span>
            <button
              onClick={loadBalance}
              className="ml-auto text-red-700 underline text-xs flex-shrink-0"
            >
              {t("common.retry")}
            </button>
          </div>
        )}

        {!loading && !error && balance && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="border border-gray-200 rounded-lg p-3 text-center"
              >
                <p className={`text-2xl font-semibold ${stat.className}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsenceBalance;
