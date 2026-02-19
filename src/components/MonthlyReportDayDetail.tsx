import React from "react";
import { DaySummary } from "../types";
import {
  formatToLocalTimeShort,
  formatMinutesToHoursMinutes,
} from "../utils/dateFormatters";

interface MonthlyReportDayDetailProps {
  day: DaySummary;
}

const MonthlyReportDayDetail: React.FC<MonthlyReportDayDetailProps> = ({
  day,
}) => {
  const formatDateDDMMYYYY = (dateStr: string): string => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-gray-500 block">Fecha</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatDateDDMMYYYY(day.date)}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 block">
            Registros
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {day.records_count}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-gray-500 block">
            Primera entrada
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {day.first_entry ? formatToLocalTimeShort(day.first_entry) : "--:--"}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 block">
            Última salida
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {day.last_exit ? formatToLocalTimeShort(day.last_exit) : "--:--"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-gray-500 block">
            Tiempo trabajado
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatMinutesToHoursMinutes(day.total_worked_minutes)}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 block">
            Tiempo de pausa
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatMinutesToHoursMinutes(day.total_pause_minutes)}
          </span>
        </div>
      </div>

      {day.has_open_session && (
        <div className="flex items-start p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm text-yellow-800 font-medium">
            Sesión abierta - falta registro de salida
          </span>
        </div>
      )}

      {day.is_modified && (
        <div className="flex items-start p-3 rounded-lg bg-blue-50 border border-blue-200">
          <svg
            className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
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
          <span className="text-sm text-blue-800 font-medium">
            Este día contiene registros modificados
          </span>
        </div>
      )}
    </div>
  );
};

export default MonthlyReportDayDetail;
