import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import { Company, TimeRecordResponse, ChangeRequestCreate } from "../types";
import { formatForDatetimeLocalInput, datetimeLocalToUTC, formatToLocalTimeShort } from "../utils/dateFormatters";

interface CreateChangeRequestProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
}

const CreateChangeRequest: React.FC<CreateChangeRequestProps> = ({
  onBack,
  userEmail,
  userPassword,
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [dayRecords, setDayRecords] = useState<TimeRecordResponse[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [newDatetime, setNewDatetime] = useState("");
  const [reason, setReason] = useState("");
  const [hasPending, setHasPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for pending requests on mount
  useEffect(() => {
    checkPendingRequest();
  }, []);

  // Load companies when component mounts
  useEffect(() => {
    loadCompanies();
  }, []);

  const checkPendingRequest = async () => {
    try {
      const response = await apiService.checkPendingChangeRequest(
        userEmail,
        userPassword
      );
      setHasPending(response.has_pending);
    } catch (err) {
      // Silently fail - not critical
      console.error("Error checking pending requests:", err);
    }
  };

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await apiService.getWorkerCompanies(
        userEmail,
        userPassword
      );
      setCompanies(response);
      if (response.length === 1) {
        setSelectedCompanyId(response[0].id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("common.loadCompaniesError");
      setError(errorMessage);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Load day records when date and company are selected
  useEffect(() => {
    if (selectedDate && selectedCompanyId) {
      loadDayRecords();
    }
  }, [selectedDate, selectedCompanyId]);

  const loadDayRecords = async () => {
    try {
      setLoadingRecords(true);
      setDayRecords([]);
      setSelectedRecordId("");
      setNewDatetime("");

      const records = await apiService.getWorkerDayRecords(
        userEmail,
        userPassword,
        selectedDate,
        selectedCompanyId
      );
      setDayRecords(records);

      if (records.length === 0) {
        setError(t("changeRequests.noRecordsForDate"));
      } else {
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("changeRequests.loadDayRecordsError");
      setError(errorMessage);
      setDayRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Auto-populate new_datetime when a record is selected
  useEffect(() => {
    if (selectedRecordId) {
      const selected = dayRecords.find((r) => r.id === selectedRecordId);
      if (selected && selected.timestamp) {
        // Convert UTC timestamp to datetime-local format (YYYY-MM-DDTHH:mm)
        const localDatetimeStr = formatForDatetimeLocalInput(selected.timestamp);
        setNewDatetime(localDatetimeStr);
        setError(null);
      }
    }
  }, [selectedRecordId, dayRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedDate) {
      setError(t("changeRequests.selectDate"));
      return;
    }

    if (!selectedCompanyId) {
      setError(t("changeRequests.selectCompany"));
      return;
    }

    if (!selectedRecordId) {
      setError(t("changeRequests.selectRecordRequired"));
      return;
    }

    if (!newDatetime) {
      setError(t("changeRequests.enterNewDatetime"));
      return;
    }

    if (reason.trim().length < 10) {
      setError(t("changeRequests.reasonMin"));
      return;
    }

    // Verify that new datetime is different from original
    const selectedRecord = dayRecords.find((r) => r.id === selectedRecordId);
    if (selectedRecord && selectedRecord.timestamp) {
      const newDate = new Date(datetimeLocalToUTC(newDatetime));
      const originalDate = new Date(selectedRecord.timestamp);

      if (newDate.getTime() === originalDate.getTime()) {
        setError(
          t("changeRequests.datetimeUnchanged")
        );
        return;
      }
    }

    setLoading(true);

    try {
      const request: ChangeRequestCreate = {
        email: userEmail,
        password: userPassword,
        date: selectedDate,
        company_id: selectedCompanyId,
        time_record_id: selectedRecordId,
        new_timestamp: datetimeLocalToUTC(newDatetime),
        reason: reason.trim(),
      };

      await apiService.createChangeRequest(request);

      setSuccess(true);
      setSelectedDate("");
      setSelectedCompanyId("");
      setSelectedRecordId("");
      setNewDatetime("");
      setReason("");
      setHasPending(true);

      // Auto-dismiss success message after 4 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("changeRequests.createError");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRecordDisplay = (record: TimeRecordResponse): string => {
    const type =
      record.record_type === "entry"
        ? t("timeRecord.recordType.entry")
        : t("timeRecord.recordType.exit");
    if (!record.timestamp) return type;

    // Format only hour:minute in local timezone
    const formattedTime = formatToLocalTimeShort(record.timestamp);
    return `${type} - ${formattedTime}`;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
        disabled={loading}
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t("changeRequests.title")}
          </h3>
        </div>

        {hasPending && (
          <div className="mx-6 mt-6 p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {t("changeRequests.pendingWarning")}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="mb-6">
            <label
              htmlFor="date"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {t("changeRequests.dateLabel")}
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              disabled={loading || hasPending}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {t("changeRequests.dateHelp")}
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="company"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {t("common.company")}
            </label>
            <select
              id="company"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              disabled={loading || loadingCompanies || hasPending || companies.length === 0}
              required
            >
              <option value="">
                {loadingCompanies
                  ? t("common.loadingCompanies")
                  : t("common.selectCompany")}
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {t("changeRequests.companyHelp")}
            </p>
          </div>

          {selectedDate && selectedCompanyId && (
            <>
              <div className="mb-6">
                <label
                  htmlFor="record"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  {t("changeRequests.recordLabel")}
                </label>
                <select
                  id="record"
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                  disabled={
                    loading ||
                    loadingRecords ||
                    hasPending ||
                    dayRecords.length === 0
                  }
                  required
                >
                  <option value="">
                    {loadingRecords
                      ? t("changeRequests.loadingRecords")
                      : dayRecords.length === 0
                      ? t("changeRequests.noRecords")
                      : t("changeRequests.selectRecord")}
                  </option>
                  {dayRecords.map((record) => (
                    <option key={record.id} value={record.id}>
                      {getRecordDisplay(record)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {t("changeRequests.recordHelp")}
                </p>
              </div>

              {selectedRecordId && (
                <div className="mb-6">
                  <label
                    htmlFor="new-datetime"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    {t("changeRequests.newDatetimeLabel")}
                  </label>
                  <input
                    type="datetime-local"
                    id="new-datetime"
                    value={newDatetime}
                    onChange={(e) => setNewDatetime(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    disabled={loading || hasPending}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {t("changeRequests.newDatetimeHelp")}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="mb-6">
            <label
              htmlFor="reason"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {t("changeRequests.reasonLabel")}
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={8}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 resize-none"
              placeholder={t("changeRequests.reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading || hasPending}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {t("changeRequests.reasonHelp")}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="truncate">{t("changeRequests.workerWithEmail", { email: userEmail })}</span>
            </div>
          </div>

          {success && (
            <div
              className="mb-4 p-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 flex items-start"
              role="alert"
            >
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {t("changeRequests.success")}
              </span>
            </div>
          )}

          {error && (
            <div
              className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 flex items-start"
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
            </div>
          )}

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors flex items-center justify-center"
              disabled={loading || hasPending}
            >
              {loading ? (
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
                  {t("changeRequests.submitting")}
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  {t("changeRequests.submit")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChangeRequest;
