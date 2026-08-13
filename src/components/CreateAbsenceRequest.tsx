import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import {
  AbsenceRequestCreate,
  AbsenceTypeOption,
  DayPortion,
  DEFAULT_ABSENCE_TYPES,
} from "../types";

interface CreateAbsenceRequestProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
  companyId: string;
  companyName?: string;
  onCreated?: () => void;
}

type Duration = "full" | "half" | "hourly";

const CreateAbsenceRequest: React.FC<CreateAbsenceRequestProps> = ({
  onBack,
  userEmail,
  userPassword,
  companyId,
  companyName,
  onCreated,
}) => {
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceTypeOption[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typeCode, setTypeCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState<Duration>("full");
  const [dayPortion, setDayPortion] = useState<DayPortion>("morning");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedType = absenceTypes.find((t) => t.code === typeCode);
  const attachmentRequired = selectedType?.requires_attachment ?? false;

  // Carga el catálogo real de tipos de la empresa; si falla, usa el fallback.
  useEffect(() => {
    let active = true;
    setLoadingTypes(true);
    apiService
      .getAbsenceTypes(userEmail, userPassword, companyId)
      .then((types) => {
        if (!active) return;
        const list = types.length > 0 ? types : DEFAULT_ABSENCE_TYPES;
        setAbsenceTypes(list);
        setTypeCode(list[0]?.code ?? "");
      })
      .catch(() => {
        if (!active) return;
        setAbsenceTypes(DEFAULT_ABSENCE_TYPES);
        setTypeCode(DEFAULT_ABSENCE_TYPES[0].code);
      })
      .finally(() => {
        if (active) setLoadingTypes(false);
      });
    return () => {
      active = false;
    };
  }, [userEmail, userPassword, companyId]);

  const resetForm = () => {
    setTypeCode(absenceTypes[0]?.code ?? "");
    setStartDate("");
    setEndDate("");
    setDuration("full");
    setDayPortion("morning");
    setStartTime("");
    setEndTime("");
    setComment("");
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!typeCode) {
      setError("Por favor, selecciona un tipo de ausencia.");
      return;
    }
    if (!startDate) {
      setError("Por favor, selecciona la fecha de inicio.");
      return;
    }
    if (!endDate) {
      setError("Por favor, selecciona la fecha de fin.");
      return;
    }
    if (endDate < startDate) {
      setError("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }
    if (duration === "hourly") {
      if (!startTime || !endTime) {
        setError("Indica la hora de inicio y de fin.");
        return;
      }
      if (endTime <= startTime) {
        setError("La hora de fin debe ser posterior a la de inicio.");
        return;
      }
    }
    if (attachmentRequired && !file) {
      setError("Este tipo de ausencia requiere adjuntar un justificante.");
      return;
    }

    setLoading(true);

    try {
      let attachmentId: string | undefined;
      if (file) {
        const uploaded = await apiService.uploadAttachment(
          userEmail,
          userPassword,
          companyId,
          file,
        );
        attachmentId = uploaded.attachment_id;
      }

      const request: AbsenceRequestCreate = {
        email: userEmail,
        password: userPassword,
        company_id: companyId,
        absence_type_code: typeCode,
        start_date: startDate,
        end_date: endDate,
        is_partial: duration === "half",
        day_portion: duration === "half" ? dayPortion : "full",
        worker_comment: comment.trim() || undefined,
        attachment_id: attachmentId,
      };

      if (duration === "hourly") {
        request.start_time = startTime;
        request.end_time = endTime;
      }

      await apiService.createAbsenceRequest(request);

      setSuccess(true);
      resetForm();
      onCreated?.();

      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la solicitud de ausencia",
      );
    } finally {
      setLoading(false);
    }
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Solicitar ausencia
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="mb-6">
            <label
              htmlFor="absence-type"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tipo de ausencia
            </label>
            <select
              id="absence-type"
              value={typeCode}
              onChange={(e) => {
                setError(null);
                setTypeCode(e.target.value);
              }}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              disabled={loading || loadingTypes}
              required
            >
              {loadingTypes ? (
                <option value="">Cargando tipos...</option>
              ) : (
                absenceTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="start-date"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Fecha de inicio
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => {
                  setError(null);
                  setStartDate(e.target.value);
                }}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Fecha de fin
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setError(null);
                  setEndDate(e.target.value);
                }}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Duración
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="radio"
                  name="duration"
                  value="full"
                  checked={duration === "full"}
                  onChange={() => {
                    setError(null);
                    setDuration("full");
                  }}
                  disabled={loading}
                  className="mr-2"
                />
                Día completo
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="radio"
                  name="duration"
                  value="half"
                  checked={duration === "half"}
                  onChange={() => {
                    setError(null);
                    setDuration("half");
                  }}
                  disabled={loading}
                  className="mr-2"
                />
                Medio día
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="radio"
                  name="duration"
                  value="hourly"
                  checked={duration === "hourly"}
                  onChange={() => {
                    setError(null);
                    setDuration("hourly");
                  }}
                  disabled={loading}
                  className="mr-2"
                />
                Por horas
              </label>
            </div>

            {duration === "half" && (
              <div className="mt-3">
                <select
                  value={dayPortion}
                  onChange={(e) => setDayPortion(e.target.value as DayPortion)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                </select>
              </div>
            )}

            {duration === "hourly" && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label
                    htmlFor="start-time"
                    className="block text-gray-600 text-xs font-medium mb-1"
                  >
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-time"
                    className="block text-gray-600 text-xs font-medium mb-1"
                  >
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Motivo (opcional)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              maxLength={1000}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 resize-none"
              placeholder="Añade un comentario para el administrador (opcional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="attachment"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Justificante{attachmentRequired ? " (obligatorio)" : " (opcional)"}
            </label>
            <input
              type="file"
              id="attachment"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
            {attachmentRequired && (
              <p className="mt-2 text-sm text-gray-500">
                Este tipo de ausencia requiere adjuntar un justificante.
              </p>
            )}
          </div>

          {companyName && (
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="truncate">Empresa: {companyName}</span>
              </div>
            </div>
          )}

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
                Solicitud enviada correctamente. Será revisada por un administrador.
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
              disabled={loading || loadingTypes}
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
                  Enviando solicitud...
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
                  Enviar solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAbsenceRequest;
