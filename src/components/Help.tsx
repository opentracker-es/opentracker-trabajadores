import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

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

const ReportIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SignatureIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// Marcado <1>/<2>/<3> de los catálogos -> <strong/>
const BOLD_COMPONENTS: { [tagName: string]: React.ReactElement } = {
  1: <strong />,
  2: <strong />,
  3: <strong />,
};

type TransProps = { i18nKey: string };

const BoldTrans: React.FC<TransProps> = ({ i18nKey }) => (
  <Trans i18nKey={i18nKey} components={BOLD_COMPONENTS} />
);

const Help: React.FC<HelpProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>("install");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleToggleLogin = () => toggleSection("login");
  const handleToggleTime = () => toggleSection("time");
  const handleToggleIncident = () => toggleSection("incident");
  const handleToggleChange = () => toggleSection("change");
  const handleToggleReport = () => toggleSection("report");
  const handleToggleSignature = () => toggleSection("signature");
  const handleTogglePassword = () => toggleSection("password");
  const handleToggleInstall = () => toggleSection("install");

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
        <h2 className="text-xl font-semibold text-gray-900">{t("help.title")}</h2>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* 1. Iniciar sesión */}
        <AccordionSection
          title={t("help.login.title")}
          icon={<LoginIcon />}
          isOpen={openSection === "login"}
          onToggle={handleToggleLogin}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.login.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.login.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.login.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.login.step3" />
            </Step>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <BoldTrans i18nKey="help.login.tip" />
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 2. Registrar jornada */}
        <AccordionSection
          title={t("help.time.title")}
          icon={<ClockIcon />}
          isOpen={openSection === "time"}
          onToggle={handleToggleTime}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.time.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.time.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.time.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.time.step3" />
            </Step>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <BoldTrans i18nKey="help.time.note" />
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 3. Reportar incidencias */}
        <AccordionSection
          title={t("help.incident.title")}
          icon={<IncidentIcon />}
          isOpen={openSection === "incident"}
          onToggle={handleToggleIncident}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.incident.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.incident.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.incident.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.incident.step3" />
            </Step>
            <Step number={4}>
              <BoldTrans i18nKey="help.incident.step4" />
            </Step>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <BoldTrans i18nKey="help.incident.examples" />
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 4. Solicitar cambios */}
        <AccordionSection
          title={t("help.change.title")}
          icon={<ChangeRequestIcon />}
          isOpen={openSection === "change"}
          onToggle={handleToggleChange}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.change.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.change.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.change.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.change.step3" />
            </Step>
            <Step number={4}>
              <BoldTrans i18nKey="help.change.step4" />
            </Step>
            <Step number={5}>
              <BoldTrans i18nKey="help.change.step5" />
            </Step>
            <Step number={6}>
              <BoldTrans i18nKey="help.change.step6" />
            </Step>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm">
                <BoldTrans i18nKey="help.change.important" />
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 5. Consultar informes mensuales */}
        <AccordionSection
          title={t("help.report.title")}
          icon={<ReportIcon />}
          isOpen={openSection === "report"}
          onToggle={handleToggleReport}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.report.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.report.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.report.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.report.step3" />
            </Step>
            <Step number={4}>
              {t("help.report.step4")}
            </Step>
            <Step number={5}>
              <BoldTrans i18nKey="help.report.step5" />
            </Step>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <BoldTrans i18nKey="help.report.note" />
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 6. Firmar registros mensuales */}
        <AccordionSection
          title={t("help.signature.title")}
          icon={<SignatureIcon />}
          isOpen={openSection === "signature"}
          onToggle={handleToggleSignature}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.signature.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.signature.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.signature.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.signature.step3" />
            </Step>
            <Step number={4}>
              <BoldTrans i18nKey="help.signature.step4" />
            </Step>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <BoldTrans i18nKey="help.signature.important" />
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* 7. Cambiar contraseña */}
        <AccordionSection
          title={t("help.password.title")}
          icon={<PasswordIcon />}
          isOpen={openSection === "password"}
          onToggle={handleTogglePassword}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 mb-4">
              {t("help.password.intro")}
            </p>
            <Step number={1}>
              <BoldTrans i18nKey="help.password.step1" />
            </Step>
            <Step number={2}>
              <BoldTrans i18nKey="help.password.step2" />
            </Step>
            <Step number={3}>
              <BoldTrans i18nKey="help.password.step3" />
            </Step>
            <Step number={4}>
              {t("help.password.step4")}
            </Step>
            <Step number={5}>
              <BoldTrans i18nKey="help.password.step5" />
            </Step>
          </div>
        </AccordionSection>

        {/* 8. Añadir a pantalla de inicio */}
        <AccordionSection
          title={t("help.install.title")}
          icon={<PhoneIcon />}
          isOpen={openSection === "install"}
          onToggle={handleToggleInstall}
        >
          <div className="space-y-6 text-sm">
            <p className="text-gray-600">
              {t("help.install.intro")}
            </p>

            {/* iOS Instructions */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">{t("help.install.iosTitle")}</h4>
              </div>

              <div className="space-y-3">
                <Step number={1}>
                  <BoldTrans i18nKey="help.install.ios1" />
                </Step>
                <Step number={2} icon={<ShareIconSimple className="w-5 h-5 text-blue-500" />}>
                  <BoldTrans i18nKey="help.install.ios2" />
                </Step>
                <Step number={3} icon={<AddToHomeIcon className="w-5 h-5 text-blue-500" />}>
                  <BoldTrans i18nKey="help.install.ios3" />
                </Step>
                <Step number={4}>
                  <BoldTrans i18nKey="help.install.ios4" />
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
                    <span className="text-xs text-gray-600">{t("help.install.appLabel")}</span>
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
                <h4 className="font-semibold text-gray-900">{t("help.install.androidTitle")}</h4>
              </div>

              <div className="space-y-3">
                <Step number={1}>
                  <BoldTrans i18nKey="help.install.android1" />
                </Step>
                <Step number={2} icon={<MenuDotsIcon className="w-5 h-5 text-gray-700" />}>
                  <BoldTrans i18nKey="help.install.android2" />
                </Step>
                <Step number={3}>
                  <BoldTrans i18nKey="help.install.android3" />
                </Step>
                <Step number={4}>
                  <BoldTrans i18nKey="help.install.android4" />
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
                    <span className="text-xs text-gray-600">{t("help.install.appLabel")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-800 text-sm">
                <BoldTrans i18nKey="help.install.advantage" />
              </p>
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
        <p>{t("help.footer")}</p>
      </div>
    </div>
  );
};

export default Help;
