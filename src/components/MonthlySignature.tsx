import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { Company, SignatureStatusResponse, SignatureMonth } from "../types";
import { getMonthName, formatToLocalTime } from "../utils/dateFormatters";
import SignatureConfirmModal from "./SignatureConfirmModal";

interface MonthlySignatureProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
}

const MonthlySignature: React.FC<MonthlySignatureProps> = ({
  onBack,
  userEmail,
  userPassword,
}) => {
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [signatureStatus, setSignatureStatus] =
    useState<SignatureStatusResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<SignatureMonth | null>(
    null
  );

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

  // Load signature status when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      loadSignatureStatus();
    }
  }, [selectedCompanyId]);

  const loadSignatureStatus = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoadingStatus(true);
      setError(null);
      const now = new Date();
      const status = await apiService.getSignatureStatus({
        email: userEmail,
        password: userPassword,
        company_id: selectedCompanyId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      });
      setSignatureStatus(status);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar el estado de firmas";
      setError(errorMessage);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleOpenModal = (month: SignatureMonth) => {
    setSelectedMonth(month);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMonth(null);
  };

  const handleConfirmSign = async () => {
    if (!selectedMonth || !selectedCompanyId) return;

    try {
      setSigning(true);
      setError(null);
      await apiService.signMonthlyReport({
        email: userEmail,
        password: userPassword,
        company_id: selectedCompanyId,
        year: selectedMonth.year,
        month: selectedMonth.month,
      });

      handleCloseModal();

      // Reload signature status after successful signing
      await loadSignatureStatus();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al firmar el informe mensual";
      setError(errorMessage);
      handleCloseModal();
    } finally {
      setSigning(false);
    }
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
        Volver al menú
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-gray-700 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">
            Firma mensual
          </h3>
        </div>

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
            <div className="mb-6">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Empresa
              </label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                disabled={signing}
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

            {loadingStatus && (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="animate-spin w-6 h-6 mx-auto mb-2 text-gray-400"
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
                Cargando estado de firmas...
              </div>
            )}

            {!loadingStatus && signatureStatus && (
              <div className="space-y-6">
                {/* Pending Signatures Section */}
                <div>
                  <div className="flex items-center mb-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 mr-2"
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
                    <h4 className="text-sm font-semibold text-gray-800">
                      Pendientes de firma
                    </h4>
                  </div>

                  {signatureStatus.pending.length === 0 ? (
                    <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Todos los meses están firmados
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg divide-y divide-yellow-200">
                      {signatureStatus.pending.map((month) => (
                        <div
                          key={`pending-${month.year}-${month.month}`}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="text-sm font-medium text-yellow-900">
                            {getMonthName(month.month)} {month.year}
                          </span>
                          <button
                            onClick={() => handleOpenModal(month)}
                            disabled={signing}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Firmar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signed Months Section */}
                {signatureStatus.signed.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-800">
                        Meses firmados
                      </h4>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg divide-y divide-green-200">
                      {signatureStatus.signed.map((month) => (
                        <div
                          key={`signed-${month.year}-${month.month}`}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="text-sm font-medium text-green-900">
                            {getMonthName(month.month)} {month.year}
                          </span>
                          <span className="text-xs text-green-700">
                            Firmado el {formatToLocalTime(month.signed_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Signature Confirmation Modal */}
      <SignatureConfirmModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSign}
        monthName={selectedMonth ? getMonthName(selectedMonth.month) : ""}
        year={selectedMonth ? selectedMonth.year : new Date().getFullYear()}
        loading={signing}
      />
    </div>
  );
};

export default MonthlySignature;
