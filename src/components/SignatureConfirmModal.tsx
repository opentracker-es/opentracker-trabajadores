import React from "react";

interface SignatureConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  monthName: string;
  year: number;
  loading: boolean;
}

const SignatureConfirmModal: React.FC<SignatureConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  monthName,
  year,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg mx-4 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-green-600 mr-2"
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
            Confirmar firma
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4">
          Vas a firmar tus registros de jornada de{" "}
          <span className="font-semibold">
            {monthName} {year}
          </span>
          . Esta acción confirma que los datos registrados son correctos.
        </p>

        {/* Legal text */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600">
            Al firmar, confirmas que has revisado los registros del mes y que son
            correctos según tu conocimiento.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4 mr-2"
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
                Firmando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
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
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureConfirmModal;
