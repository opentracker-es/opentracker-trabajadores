import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { TimeRecordResponse } from "../types";

interface FormData {
  email: string;
  password: string;
  company_id: string;
}

const TimeRecordForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    company_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TimeRecordResponse | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Check configuration on mount
  useEffect(() => {
    const checkConfig = () => {
      if (
        !import.meta.env.VITE_API_USERNAME ||
        !import.meta.env.VITE_API_PASSWORD
      ) {
        setConfigError(
          "API credentials not configured. Please check your .env file.",
        );
      }
    };
    checkConfig();
  }, []);

  const formatDateTime = (dateStr: string, timezone?: string): string => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    return date.toLocaleString("es-ES", options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await apiService.createTimeRecord(formData);
      setSuccess(response);
      // Clear form
      setFormData({ email: "", password: "", company_id: "" });

      // Clear success message after 10 seconds
      setTimeout(() => setSuccess(null), 10000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);

      // Don't auto-clear configuration errors
      if (
        !errorMessage.includes("API authentication failed") &&
        !errorMessage.includes("Unable to connect to API")
      ) {
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (configError) {
    return (
      <div className="w-full max-w-md">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Configuration Error!</strong>
          <span className="block sm:inline"> {configError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            name="email"
            placeholder="worker@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            name="password"
            placeholder="******************"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div
            className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mb-4 p-4 text-sm text-green-800 rounded-lg bg-green-50"
            role="alert"
          >
            <p className="font-medium">Time record created successfully!</p>
            <p>Type: {success.record_type === "entry" ? "Entry" : "Exit"}</p>
            <p>
              Time: {formatDateTime(success.timestamp)}
            </p>
            {success.duration_minutes && (
              <p>Duration: {formatDuration(success.duration_minutes)}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeRecordForm;
