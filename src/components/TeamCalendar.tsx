import React, { useState, useEffect, useCallback } from "react";
import apiService from "../services/api";
import { TeamCalendarEntry } from "../types";

interface TeamCalendarProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
  companyId: string;
}

function formatDateDMY(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatRange(start: string, end: string): string {
  return start === end ? formatDateDMY(start) : `${formatDateDMY(start)} → ${formatDateDMY(end)}`;
}

/** Rango por defecto: desde hoy hasta dentro de 3 meses (formato YYYY-MM-DD). */
function defaultRange(): { start: string; end: string } {
  const today = new Date();
  const end = new Date(today);
  end.setMonth(end.getMonth() + 3);
  const toISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: toISODate(today), end: toISODate(end) };
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  onBack,
  userEmail,
  userPassword,
  companyId,
}) => {
  const [range] = useState(defaultRange);
  const [entries, setEntries] = useState<TeamCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTeamCalendar(
        userEmail,
        userPassword,
        companyId,
        range.start,
        range.end,
      );
      const sorted = [...data].sort(
        (a, b) => a.start_date.localeCompare(b.start_date),
      );
      setEntries(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }, [userEmail, userPassword, companyId, range.start, range.end]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  return (
    <div className="space-y-4">
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
        Volver
      </button>

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
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65"
              />
            </svg>
            Quién está fuera
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Del {formatDateDMY(range.start)} al {formatDateDMY(range.end)}
          </p>
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
              Cargando...
            </div>
          )}

          {error && !loading && (
            <div
              className="p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 flex items-start"
              role="alert"
            >
              <span>{error}</span>
              <button
                onClick={loadCalendar}
                className="ml-auto text-red-700 underline text-xs flex-shrink-0"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              No hay ausencias previstas en este periodo.
            </p>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="space-y-3">
              {entries.map((entry, idx) => (
                <div
                  key={`${entry.worker_name}-${entry.start_date}-${idx}`}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {entry.worker_name}
                  </span>
                  <span className="text-sm text-gray-600 flex-shrink-0">
                    {formatRange(entry.start_date, entry.end_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
