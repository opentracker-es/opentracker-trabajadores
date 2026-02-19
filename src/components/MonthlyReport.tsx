import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { Company, MonthlyReportResponse } from "../types";
import {
  formatToLocalTimeShort,
  getMonthName,
  formatMinutesToHoursMinutes,
} from "../utils/dateFormatters";
import { generateMonthlyReportPDF } from "../utils/pdfGenerator";
import MonthlyReportDayDetail from "./MonthlyReportDayDetail";

interface MonthlyReportProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({
  onBack,
  userEmail,
  userPassword,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Load companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const companiesData = await apiService.getWorkerCompanies(
          userEmail,
          userPassword
        );
        setCompanies(companiesData);

        // Select first company by default
        if (companiesData.length > 0) {
          setSelectedCompanyId(companiesData[0].id);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al cargar las empresas";
        setError(errorMessage);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [userEmail, userPassword]);

  const handleGenerateReport = async () => {
    if (!selectedCompanyId) {
      setError("Por favor, selecciona una empresa");
      return;
    }

    setError(null);
    setReport(null);
    setExpandedDays(new Set());
    setLoadingReport(true);

    try {
      const reportData = await apiService.getMonthlyReport({
        email: userEmail,
        password: userPassword,
        company_id: selectedCompanyId,
        year: selectedYear,
        month: selectedMonth,
      });
      setReport(reportData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al generar el informe";
      setError(errorMessage);
    } finally {
      setLoadingReport(false);
    }
  };

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const formatDateShort = (dateStr: string): string => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const getSignatureBadge = () => {
    if (!report) return null;

    const config = {
      signed: {
        label: "Firmado",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-300",
      },
      pending: {
        label: "Pendiente",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-300",
      },
      not_required: {
        label: "No requerida",
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        borderColor: "border-gray-300",
      },
    };

    const status = config[report.signature_status];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} border ${status.borderColor}`}
      >
        {report.signature_status === "signed" && (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {report.signature_status === "pending" && (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {status.label}
      </span>
    );
  };

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors mb-4"
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
        Volver al menú
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 text-blue-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Informe mensual
        </h3>

        {loadingCompanies && (
          <div className="mb-4 p-4 text-sm text-blue-800 rounded-lg bg-blue-50 border border-blue-200">
            Cargando empresas...
          </div>
        )}

        {!loadingCompanies && companies.length === 0 && (
          <div className="mb-4 p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 border border-yellow-200">
            No tienes empresas asociadas. Contacta con el administrador.
          </div>
        )}

        {!loadingCompanies && companies.length > 0 && (
          <>
            {/* Company selector */}
            <div className="mb-4">
              <label
                htmlFor="report-company"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Empresa
              </label>
              <select
                id="report-company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                disabled={loadingReport}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year and month selectors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="report-year"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Año
                </label>
                <select
                  id="report-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                  disabled={loadingReport}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="report-month"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mes
                </label>
                <select
                  id="report-month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                  disabled={loadingReport}
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div
                className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerateReport}
              disabled={loadingReport || !selectedCompanyId}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loadingReport ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando informe...
                </>
              ) : (
                <>
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
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generar informe
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Report results */}
      {report && (
        <div className="space-y-4">
          {/* Summary card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Resumen
                </h4>
                {getSignatureBadge()}
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Trabajador
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {report.worker_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Empresa
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {report.company_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Periodo
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {getMonthName(report.month)} {report.year}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <span className="text-xs font-medium text-blue-600 block">
                      Días trabajados
                    </span>
                    <span className="text-xl font-bold text-blue-900">
                      {report.total_days_worked}
                    </span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <span className="text-xs font-medium text-green-600 block">
                      Horas totales
                    </span>
                    <span className="text-xl font-bold text-green-900">
                      {formatMinutesToHoursMinutes(report.total_worked_minutes)}
                    </span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <span className="text-xs font-medium text-orange-600 block">
                      Pausas totales
                    </span>
                    <span className="text-xl font-bold text-orange-900">
                      {formatMinutesToHoursMinutes(report.total_pause_minutes)}
                    </span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <span className="text-xs font-medium text-purple-600 block">
                      Horas extra
                    </span>
                    <span className="text-xl font-bold text-purple-900">
                      {formatMinutesToHoursMinutes(report.total_overtime_minutes)}
                    </span>
                  </div>
                </div>
              </div>

              {report.signed_at && (
                <div className="text-xs text-gray-500 text-center pt-2">
                  Firmado el{" "}
                  {new Date(report.signed_at).toLocaleString("es-ES", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Download PDF button */}
          <button
            onClick={() => generateMonthlyReportPDF(report)}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descargar PDF
          </button>

          {/* Daily details table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
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
                Detalle diario
              </h4>
            </div>

            {report.daily_details.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                No hay registros para este periodo.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Table header - visible on md+ */}
                <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>Fecha</span>
                  <span>Entrada</span>
                  <span>Salida</span>
                  <span>Trabajado</span>
                  <span>Pausas</span>
                </div>

                {report.daily_details.map((day) => (
                  <div key={day.date}>
                    {/* Row - clickable to expand */}
                    <button
                      onClick={() => toggleDay(day.date)}
                      className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                    >
                      {/* Mobile layout */}
                      <div className="md:hidden">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDateShort(day.date)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {day.has_open_session && (
                              <svg
                                className="w-4 h-4 text-yellow-500"
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
                            )}
                            {day.is_modified && (
                              <svg
                                className="w-4 h-4 text-blue-500"
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
                            )}
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                expandedDays.has(day.date)
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {day.first_entry
                              ? formatToLocalTimeShort(day.first_entry)
                              : "--:--"}{" "}
                            -{" "}
                            {day.last_exit
                              ? formatToLocalTimeShort(day.last_exit)
                              : "--:--"}
                          </span>
                          <span className="font-medium text-gray-700">
                            {formatMinutesToHoursMinutes(
                              day.total_worked_minutes
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateShort(day.date)}
                          </span>
                          {day.has_open_session && (
                            <svg
                              className="w-4 h-4 text-yellow-500"
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
                          )}
                          {day.is_modified && (
                            <svg
                              className="w-4 h-4 text-blue-500"
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
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {day.first_entry
                            ? formatToLocalTimeShort(day.first_entry)
                            : "--:--"}
                        </span>
                        <span className="text-sm text-gray-700">
                          {day.last_exit
                            ? formatToLocalTimeShort(day.last_exit)
                            : "--:--"}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatMinutesToHoursMinutes(
                            day.total_worked_minutes
                          )}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {formatMinutesToHoursMinutes(
                              day.total_pause_minutes
                            )}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedDays.has(day.date) ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {expandedDays.has(day.date) && (
                      <div className="px-6 pb-4">
                        <MonthlyReportDayDetail day={day} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;
