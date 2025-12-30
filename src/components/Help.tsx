import React, { useState } from "react";

interface HelpProps {
  onBack: () => void;
}

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  children,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center">
          <span className="w-8 h-8 flex items-center justify-center text-blue-500 mr-3">
            {icon}
          </span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
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
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

interface StepProps {
  number: number;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, children, icon }) => {
  return (
    <div className="flex items-start mb-3 last:mb-0">
      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span className="text-gray-700">{children}</span>
        </div>
      </div>
    </div>
  );
};

// SVG Icons
const LoginIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IncidentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChangeRequestIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PasswordIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

// iOS Share icon (simplified)
const ShareIconSimple = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12M12 3l4 4M12 3L8 7" />
  </svg>
);

// Android menu dots icon
const MenuDotsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

// Plus in square icon
const AddToHomeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path strokeLinecap="round" d="M12 8v8M8 12h8" />
  </svg>
);

const Help: React.FC<HelpProps> = ({ onBack }) => {
  const [openSection, setOpenSection] = useState<string | null>("install");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Ayuda</h2>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* 1. Iniciar sesión */}
        <AccordionSection
          title="Iniciar sesión"
          icon={<LoginIcon />}
          isOpen={openSection === "login"}
          onToggle={() => toggleSection("login")}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              Para acceder a la aplicación necesitas las credenciales proporcionadas por tu empresa.
            </p>
            <Step number={1}>
              Introduce tu <strong>email</strong> de trabajo.
            </Step>
            <Step number={2}>
              Introduce tu <strong>contraseña</strong>.
            </Step>
            <Step number={3}>
              Pulsa <strong>"Iniciar sesión"</strong>.
            </Step>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Consejo:</strong> Si olvidaste tu contraseña, pulsa en "¿Olvidaste tu contraseña?"
                para recibir un enlace de recuperación en tu email.
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 2. Registrar jornada */}
        <AccordionSection
          title="Registrar jornada"
          icon={<ClockIcon />}
          isOpen={openSection === "time"}
          onToggle={() => toggleSection("time")}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              Registra tu entrada y salida del trabajo de forma sencilla.
            </p>
            <Step number={1}>
              Pulsa en <strong>"Crear registro de jornada"</strong> en el menú principal.
            </Step>
            <Step number={2}>
              Si trabajas para varias empresas, <strong>selecciona la empresa</strong> correspondiente.
            </Step>
            <Step number={3}>
              Pulsa el botón de <strong>"Entrada"</strong> o <strong>"Salida"</strong> según corresponda.
            </Step>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Nota:</strong> El sistema alterna automáticamente entre entrada y salida.
                Si tu último registro fue una entrada, el siguiente será una salida.
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 3. Reportar incidencias */}
        <AccordionSection
          title="Reportar incidencias"
          icon={<IncidentIcon />}
          isOpen={openSection === "incident"}
          onToggle={() => toggleSection("incident")}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              Comunica cualquier problema o situación especial relacionada con tu jornada.
            </p>
            <Step number={1}>
              Pulsa en <strong>"Crear incidencia"</strong> en el menú principal.
            </Step>
            <Step number={2}>
              Selecciona la <strong>empresa</strong> si trabajas para varias.
            </Step>
            <Step number={3}>
              Describe detalladamente la <strong>incidencia</strong> en el campo de texto.
            </Step>
            <Step number={4}>
              Pulsa <strong>"Enviar incidencia"</strong>.
            </Step>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Ejemplos de incidencias:</strong> Olvidé fichar, problemas técnicos,
                ausencia justificada, etc.
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 4. Solicitar cambios */}
        <AccordionSection
          title="Solicitar cambios de registro"
          icon={<ChangeRequestIcon />}
          isOpen={openSection === "change"}
          onToggle={() => toggleSection("change")}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              Si cometiste un error en un registro, puedes solicitar una corrección.
            </p>
            <Step number={1}>
              Pulsa en <strong>"Petición de cambio de registro"</strong>.
            </Step>
            <Step number={2}>
              Selecciona la <strong>fecha</strong> del registro que quieres modificar.
            </Step>
            <Step number={3}>
              Selecciona el <strong>registro específico</strong> (entrada o salida).
            </Step>
            <Step number={4}>
              Indica la <strong>nueva hora correcta</strong>.
            </Step>
            <Step number={5}>
              Escribe el <strong>motivo</strong> de la solicitud.
            </Step>
            <Step number={6}>
              Pulsa <strong>"Enviar solicitud"</strong>.
            </Step>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm">
                <strong>Importante:</strong> La solicitud quedará pendiente de aprobación
                por parte del administrador.
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 5. Cambiar contraseña */}
        <AccordionSection
          title="Cambiar contraseña"
          icon={<PasswordIcon />}
          isOpen={openSection === "password"}
          onToggle={() => toggleSection("password")}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              Puedes cambiar tu contraseña en cualquier momento desde los ajustes.
            </p>
            <Step number={1}>
              Pulsa en <strong>"Ajustes"</strong> en el menú principal.
            </Step>
            <Step number={2}>
              Introduce tu <strong>contraseña actual</strong>.
            </Step>
            <Step number={3}>
              Introduce la <strong>nueva contraseña</strong> (mínimo 6 caracteres).
            </Step>
            <Step number={4}>
              Confirma la nueva contraseña.
            </Step>
            <Step number={5}>
              Pulsa <strong>"Cambiar contraseña"</strong>.
            </Step>
          </div>
        </AccordionSection>

        {/* 6. Añadir a pantalla de inicio */}
        <AccordionSection
          title="Añadir a pantalla de inicio"
          icon={<PhoneIcon />}
          isOpen={openSection === "install"}
          onToggle={() => toggleSection("install")}
        >
          <div className="space-y-6 text-sm">
            <p className="text-gray-600">
              Puedes añadir esta aplicación a la pantalla de inicio de tu teléfono
              para acceder más rápidamente, como si fuera una app nativa.
            </p>

            {/* iOS Instructions */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">iPhone / iPad (Safari)</h4>
              </div>

              <div className="space-y-3">
                <Step number={1}>
                  Abre esta página en <strong>Safari</strong> (es obligatorio usar Safari).
                </Step>
                <Step number={2} icon={<ShareIconSimple className="w-5 h-5 text-blue-500" />}>
                  Pulsa el icono de <strong>compartir</strong> en la barra inferior.
                </Step>
                <Step number={3} icon={<AddToHomeIcon className="w-5 h-5 text-blue-500" />}>
                  Desplázate y selecciona <strong>"Añadir a pantalla de inicio"</strong>.
                </Step>
                <Step number={4}>
                  Confirma el nombre y pulsa <strong>"Añadir"</strong>.
                </Step>
              </div>

              <div className="mt-4 flex justify-center">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Jornada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Android Instructions */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 11.48l1.78-3.08c.1-.18.04-.4-.13-.51-.17-.1-.4-.04-.5.13l-1.8 3.12c-1.37-.59-2.9-.92-4.55-.92s-3.18.33-4.55.92l-1.8-3.12c-.1-.17-.33-.23-.5-.13-.17.1-.23.33-.13.51l1.78 3.08C4.07 13.18 1.84 16.19 1.5 19.5h21c-.34-3.31-2.57-6.32-4.9-8.02zM7 17.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Android (Chrome)</h4>
              </div>

              <div className="space-y-3">
                <Step number={1}>
                  Abre esta página en <strong>Google Chrome</strong>.
                </Step>
                <Step number={2} icon={<MenuDotsIcon className="w-5 h-5 text-gray-700" />}>
                  Pulsa el icono de <strong>menú</strong> (tres puntos verticales) arriba a la derecha.
                </Step>
                <Step number={3}>
                  Selecciona <strong>"Añadir a pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.
                </Step>
                <Step number={4}>
                  Confirma pulsando <strong>"Añadir"</strong>.
                </Step>
              </div>

              <div className="mt-4 flex justify-center">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-2">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Jornada</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-800 text-sm">
                <strong>Ventaja:</strong> Una vez añadida, la aplicación se abrirá a pantalla completa,
                sin la barra de direcciones del navegador, ofreciendo una experiencia más cómoda.
              </p>
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
        <p>OpenJornada - Registro de Jornada</p>
      </div>
    </div>
  );
};

export default Help;
