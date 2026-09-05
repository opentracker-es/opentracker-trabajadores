import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import { TimeRecordResponse, Company, PauseType, WorkerCurrentStatus } from "../types";
import { formatToLocalTime } from "../utils/dateFormatters";

interface CreateTimeRecordProps {
  credentials: {
    email: string;
    password: string;
  };
  onBack: () => void;
}

const CreateTimeRecord: React.FC<CreateTimeRecordProps> = ({
  credentials,
  onBack,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TimeRecordResponse | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<WorkerCurrentStatus | null>(null);
  const [pauseTypes, setPauseTypes] = useState<PauseType[]>([]);
  const [selectedPauseTypeId, setSelectedPauseTypeId] = useState<string>("");
  const [showPauseSelection, setShowPauseSelection] = useState(false);

  const formatDateTime = (dateStr: string): string => {
    return formatToLocalTime(dateStr);
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return t("common.durationZero");
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return t("common.duration", { hours, minutes: mins });
  };

  // Load companies on component mount
  useEffect(() => {
    let active = true;
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const companiesData = await apiService.getWorkerCompanies(
          credentials.email,
          credentials.password
        );
        if (!active) return;
        setCompanies(companiesData);

        // Select first company by default
        if (companiesData.length > 0) {
          setSelectedCompanyId(companiesData[0].id);
        }
      } catch (err) {
        if (!active) return;
        const errorMessage =
          err instanceof Error
            ? err.message
            : t("common.loadCompaniesError");
        setError(errorMessage);
      } finally {
        if (active) setLoadingCompanies(false);
      }
    };

    loadCompanies();
    return () => {
      active = false;
    };
  }, [credentials.email, credentials.password]);

  // Load current status when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      loadCurrentStatus();
      loadPauseTypes();
    }
  }, [selectedCompanyId]);

  const loadCurrentStatus = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoadingStatus(true);
      const status = await apiService.getCurrentStatus(
        credentials.email,
        credentials.password,
        selectedCompanyId
      );
      setCurrentStatus(status);
    } catch (err) {
      // Don't show error for status loading - just log it
      console.error("Error loading status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadPauseTypes = async () => {
    if (!selectedCompanyId) return;

    try {
      const types = await apiService.getAvailablePauseTypes(
        credentials.email,
        credentials.password,
        selectedCompanyId
      );
      setPauseTypes(types);
      if (types.length > 0) {
        setSelectedPauseTypeId(types[0].id);
      }
    } catch (err) {
      console.error("Error loading pause types:", err);
    }
  };

  const handleAction = async (action: 'entry' | 'exit' | 'pause_start' | 'pause_end') => {
    setError(null);
    setSuccess(null);

    // Validate company selected
    if (!selectedCompanyId) {
      setError(t("timeRecord.selectCompany"));
      return;
    }

    // Validate pause type for pause_start
    if (action === 'pause_start' && !selectedPauseTypeId) {
      setError(t("timeRecord.selectPauseType"));
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createTimeRecord({
        ...credentials,
        company_id: selectedCompanyId,
        action: action,
        pause_type_id: action === 'pause_start' ? selectedPauseTypeId : undefined,
      });
      setSuccess(response);
      setShowPauseSelection(false);

      // Reload status after successful action
      await loadCurrentStatus();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.network.unexpected");
      setError(errorMessage);

      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!currentStatus) return null;

    const statusConfig = {
      logged_out: {
        label: t("timeRecord.status.loggedOut"),
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-300"
      },
      logged_in: {
        label: t("timeRecord.status.loggedIn"),
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-300"
      },
      on_pause: {
        label: t("timeRecord.status.onPause"),
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        borderColor: "border-orange-300"
      },
    };

    const config = statusConfig[currentStatus.status];

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
        <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
        {config.label}
      </div>
    );
  };

  const getRecordTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entry: t("timeRecord.recordType.entry"),
      exit: t("timeRecord.recordType.exit"),
      pause_start: t("timeRecord.recordType.pauseStart"),
      pause_end: t("timeRecord.recordType.pauseEnd"),
    };
    return labels[type] || type;
  };

  const handleSelectCompany = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value);
  };

  const handleSelectPauseType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPauseTypeId(e.target.value);
  };

  const handleStartPauseSelection = () => setShowPauseSelection(true);
  const handleCancelPauseSelection = () => setShowPauseSelection(false);
  const handleEntry = () => handleAction('entry');
  const handleExit = () => handleAction('exit');
  const handlePauseStart = () => handleAction('pause_start');
  const handlePauseEnd = () => handleAction('pause_end');

  const renderActionButtons = () => {
    if (!currentStatus || loadingStatus) {
      return (
        <div className="text-center text-gray-500 py-4">
          {t("timeRecord.loadingStatus")}
        </div>
      );
    }

    if (currentStatus.status === "logged_out") {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            {t("timeRecord.noShiftHelp")}
          </p>
          <button
            onClick={handleEntry}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {loading ? t("common.processing") : t("timeRecord.clockIn")}
          </button>
        </div>
      );
    }

    if (currentStatus.status === "logged_in") {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">{t("timeRecord.entryTime")}</span>
              <span className="text-sm text-blue-700">
                {formatDateTime(currentStatus.entry_time!)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{t("timeRecord.timeWorked")}</span>
              <span className="text-lg font-bold text-blue-700">
                {formatDuration(currentStatus.time_worked_minutes)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t("timeRecord.onShiftHelp")}
          </p>

          {!showPauseSelection && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStartPauseSelection}
                disabled={loading || pauseTypes.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("timeRecord.startPause")}
              </button>
              <button
                onClick={handleExit}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t("timeRecord.clockOut")}
              </button>
            </div>
          )}

          {showPauseSelection && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-orange-900">{t("timeRecord.choosePauseType")}</h4>
                <button
                  onClick={handleCancelPauseSelection}
                  className="text-orange-600 hover:text-orange-800 text-sm"
                >
                  {t("common.cancel")}
                </button>
              </div>

              <select
                value={selectedPauseTypeId}
                onChange={handleSelectPauseType}
                className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                disabled={loading}
              >
                {pauseTypes.map((pauseType) => (
                  <option key={pauseType.id} value={pauseType.id}>
                    {pauseType.name} {pauseType.type === 'inside_shift' ? t('timeRecord.pauseCountsAsWork') : t('timeRecord.pauseOutsideShift')}
                  </option>
                ))}
              </select>

              {selectedPauseTypeId && (
                <div className="text-xs text-orange-700">
                  {pauseTypes.find(p => p.id === selectedPauseTypeId)?.description}
                </div>
              )}

              <button
                onClick={handlePauseStart}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t("common.processing") : t("timeRecord.confirmPause")}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (currentStatus.status === "on_pause") {
      return (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-orange-900">{t("timeRecord.pauseType")}</span>
                <span className="text-sm font-bold text-orange-700">
                  {currentStatus.pause_type_name}
                </span>
              </div>
              <div className="text-xs text-orange-600">
                {currentStatus.pause_counts_as_work
                  ? t("timeRecord.countsAsWork")
                  : t("timeRecord.notCountsAsWork")}
              </div>
            </div>

            <div className="border-t border-orange-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">{t("timeRecord.pauseDuration")}</span>
                <span className="text-lg font-bold text-orange-700">
                  {formatDuration(currentStatus.pause_duration_minutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-900">{t("timeRecord.workedToday")}</span>
                <span className="text-sm text-orange-700">
                  {formatDuration(currentStatus.time_worked_minutes)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t("timeRecord.onPauseHelp")}
          </p>

          <button
            onClick={handlePauseEnd}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {loading ? t("common.processing") : t("timeRecord.endPause")}
          </button>
        </div>
      );
    }

    return null;
  };

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
        {t("common.backToMenu")}
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("timeRecord.title")}
          </h3>
          {getStatusBadge()}
        </div>

        {loadingCompanies && (
          <div className="mb-4 p-4 text-sm text-blue-800 rounded-lg bg-blue-50 border border-blue-200">
            {t("common.loadingCompanies")}
          </div>
        )}

        {!loadingCompanies && companies.length === 0 && (
          <div className="mb-4 p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 border border-yellow-200">
            {t("common.noCompanies")}
          </div>
        )}

        {!loadingCompanies && companies.length > 0 && (
          <>
            <div className="mb-6">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("common.company")}
              </label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={handleSelectCompany}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                disabled={loading}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="mb-4 p-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200"
                role="alert"
              >
                <p className="font-medium mb-2">{t("timeRecord.createdTitle")}</p>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">{t("timeRecord.typeLabel")}</span>{" "}
                    {getRecordTypeLabel(success.record_type)}
                  </p>
                  {success.pause_type_name && (
                    <p>
                      <span className="font-medium">{t("timeRecord.pauseLabel")}</span>{" "}
                      {success.pause_type_name}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">{t("timeRecord.timeLabel")}</span>{" "}
                    {formatDateTime(success.timestamp)}
                  </p>
                  {success.duration_minutes && (
                    <p>
                      <span className="font-medium">{t("timeRecord.durationLabel")}</span>{" "}
                      {formatDuration(success.duration_minutes)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {renderActionButtons()}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateTimeRecord;
