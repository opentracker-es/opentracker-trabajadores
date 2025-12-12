import React from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  companyName: string;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onAccept, companyName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Información sobre protección de datos
              </h2>
              <p className="text-sm text-gray-600">
                Registro de jornada laboral
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <p>
              De acuerdo con el <strong>Reglamento General de Protección de Datos (RGPD)</strong> y
              la <strong>Ley Orgánica 3/2018 de Protección de Datos Personales</strong>, te informamos:
            </p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[120px]">Responsable:</span>
                <span>{companyName}</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[120px]">Finalidad:</span>
                <span>Registro de tu jornada laboral conforme al artículo 34.9 del Estatuto de los Trabajadores.</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[120px]">Base legal:</span>
                <span>Cumplimiento de obligación legal (Art. 6.1.c RGPD).</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[120px]">Datos tratados:</span>
                <span>Nombre, email, registros de entrada/salida y pausas.</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[120px]">Conservación:</span>
                <span>Mínimo 4 años según la legislación laboral vigente.</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[120px]">Destinatarios:</span>
                <span>Inspección de Trabajo y autoridades competentes cuando lo requieran.</span>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
              <p className="font-medium text-blue-900">Tus derechos</p>
              <p className="text-blue-800 mt-1">
                Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad,
                limitación y oposición contactando con el departamento de Recursos Humanos de tu empresa.
              </p>
            </div>

            <p className="text-gray-600 text-xs">
              El registro de jornada es una obligación legal de tu empleador. No se requiere tu
              consentimiento para este tratamiento, pero tienes derecho a ser informado sobre cómo
              se gestionan tus datos.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onAccept}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              He leído y entendido la información
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Esta información se mostrará solo una vez. Puedes consultarla en cualquier momento
              desde los ajustes de tu perfil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
