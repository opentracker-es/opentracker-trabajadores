import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CreateTimeRecord from "./CreateTimeRecord";
import CreateIncident from "./CreateIncident";
import CreateChangeRequest from "./CreateChangeRequest";
import MyChangeRequests from "./MyChangeRequests";
import MonthlyReport from "./MonthlyReport";
import MonthlySignature from "./MonthlySignature";
import AbsencesSection from "./AbsencesSection";
import Settings from "./Settings";
import Help from "./Help";
import InAppLanguageSelector from "./InAppLanguageSelector";
import PrivacyModal from "./PrivacyModal";
import Footer from "./Footer";
import apiService from "../services/api";
import { Company } from "../types";

interface DashboardProps {
  userData: {
    workerName: string;
    email: string;
    password: string;
  };
  appName: string;
  onLogout: () => void;
}

type View = "menu" | "time-record" | "incident" | "change-request" | "my-change-requests" | "monthly-report" | "monthly-signature" | "absences" | "settings" | "help";

const PRIVACY_ACCEPTED_KEY = "openjornada_privacy_accepted";

const MENU_BUTTON_CLASS =
  "w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm";

const Dashboard: React.FC<DashboardProps> = ({ userData, appName, onLogout }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<View>("menu");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // Empresas del trabajador con el módulo de ausencias activo (gating opt-in, tarea 6.7).
  const [absenceCompanies, setAbsenceCompanies] = useState<Company[]>([]);

  useEffect(() => {
    // Check if user has already accepted the privacy notice
    const privacyAccepted = localStorage.getItem(PRIVACY_ACCEPTED_KEY);
    if (!privacyAccepted) {
      setShowPrivacyModal(true);
    }
  }, []);

  useEffect(() => {
    // Determina el gating de la sección de ausencias: solo se muestra si al
    // menos una empresa del trabajador tiene `absence_management_enabled`.
    let active = true;
    apiService
      .getWorkerCompanies(userData.email, userData.password)
      .then((companies) => {
        if (active) {
          setAbsenceCompanies(companies.filter((c) => c.absence_management_enabled));
        }
      })
      .catch(() => {
        // Silencioso: si falla, la sección de ausencias simplemente no se ofrece.
      });
    return () => {
      active = false;
    };
  }, [userData.email, userData.password]);

  const handleAcceptPrivacy = () => {
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, new Date().toISOString());
    setShowPrivacyModal(false);
  };

  const handleShowPrivacy = () => {
    setShowPrivacyModal(true);
  };

  const handleGoTimeRecord = () => setCurrentView("time-record");
  const handleGoIncident = () => setCurrentView("incident");
  const handleGoChangeRequest = () => setCurrentView("change-request");
  const handleGoMyChangeRequests = () => setCurrentView("my-change-requests");
  const handleGoMonthlyReport = () => setCurrentView("monthly-report");
  const handleGoMonthlySignature = () => setCurrentView("monthly-signature");
  const handleGoAbsences = () => setCurrentView("absences");
  const handleGoSettings = () => setCurrentView("settings");
  const handleGoHelp = () => setCurrentView("help");
  const handleBackToMenu = () => setCurrentView("menu");

  const renderContent = () => {
    switch (currentView) {
      case "time-record":
        return (
          <CreateTimeRecord
            credentials={{ email: userData.email, password: userData.password }}
            onBack={handleBackToMenu}
          />
        );
      case "incident":
        return (
          <CreateIncident
            onBack={handleBackToMenu}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "change-request":
        return (
          <CreateChangeRequest
            onBack={handleBackToMenu}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "my-change-requests":
        return (
          <MyChangeRequests
            onBack={handleBackToMenu}
            userEmail={userData.email}
            userPassword={userData.password}
            onNewRequest={handleGoChangeRequest}
          />
        );
      case "monthly-report":
        return (
          <MonthlyReport
            onBack={handleBackToMenu}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "monthly-signature":
        return (
          <MonthlySignature
            onBack={handleBackToMenu}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "absences":
        return (
          <AbsencesSection
            onBack={handleBackToMenu}
            userEmail={userData.email}
            userPassword={userData.password}
            companies={absenceCompanies}
          />
        );
      case "settings":
        return (
          <Settings
            email={userData.email}
            password={userData.password}
            onBack={handleBackToMenu}
          />
        );
      case "help":
        return (
          <Help
            onBack={handleBackToMenu}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <button onClick={handleGoTimeRecord} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
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
              {t("dashboard.menu.timeRecord")}
            </button>

            <button onClick={handleGoIncident} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t("dashboard.menu.incident")}
            </button>

            <button onClick={handleGoChangeRequest} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
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
              {t("dashboard.menu.changeRequest")}
            </button>

            <button onClick={handleGoMyChangeRequests} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {t("dashboard.menu.myChangeRequests")}
            </button>

            <button onClick={handleGoMonthlyReport} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
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
              {t("dashboard.menu.monthlyReport")}
            </button>

            <button onClick={handleGoMonthlySignature} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
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
              {t("dashboard.menu.monthlySignature")}
            </button>

            {absenceCompanies.length > 0 && (
              <button onClick={handleGoAbsences} className={MENU_BUTTON_CLASS}>
                <svg
                  className="w-5 h-5 mr-3 text-blue-500"
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
                {t("dashboard.menu.absences")}
              </button>
            )}

            <button onClick={handleGoSettings} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t("dashboard.menu.settings")}
            </button>

            <button onClick={handleGoHelp} className={MENU_BUTTON_CLASS}>
              <svg
                className="w-5 h-5 mr-3 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("dashboard.menu.help")}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4">
      <PrivacyModal
        isOpen={showPrivacyModal}
        onAccept={handleAcceptPrivacy}
        companyName={appName}
      />

      <div className="max-w-2xl mx-auto py-8">
        {/* Chrome global: todas las vistas autenticadas se renderizan dentro de
            Dashboard, así que el selector de idioma va aquí una sola vez. */}
        <div className="flex items-center justify-end gap-4 mb-4">
          <InAppLanguageSelector />
          <button
            onClick={onLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("dashboard.logout")}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="space-y-3 pb-6 pt-6 px-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">
              {t("dashboard.title")}
            </h1>
            <div className="text-center space-y-1">
              <p className="text-base font-medium text-gray-700">{appName}</p>
              <p className="text-sm text-gray-600">{userData.workerName}</p>
            </div>
          </div>
          <div className="p-6">{renderContent()}</div>
        </div>

        <Footer onShowPrivacy={handleShowPrivacy} />
      </div>
    </div>
  );
};

export default Dashboard;
