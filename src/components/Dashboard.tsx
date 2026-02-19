import React, { useState, useEffect } from "react";
import CreateTimeRecord from "./CreateTimeRecord";
import CreateIncident from "./CreateIncident";
import CreateChangeRequest from "./CreateChangeRequest";
import MonthlyReport from "./MonthlyReport";
import MonthlySignature from "./MonthlySignature";
import Settings from "./Settings";
import Help from "./Help";
import PrivacyModal from "./PrivacyModal";
import Footer from "./Footer";

interface DashboardProps {
  userData: {
    workerName: string;
    email: string;
    password: string;
  };
  appName: string;
  onLogout: () => void;
}

type View = "menu" | "time-record" | "incident" | "change-request" | "monthly-report" | "monthly-signature" | "settings" | "help";

const PRIVACY_ACCEPTED_KEY = "opentracker_privacy_accepted";

const Dashboard: React.FC<DashboardProps> = ({ userData, appName, onLogout }) => {
  const [currentView, setCurrentView] = useState<View>("menu");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the privacy notice
    const privacyAccepted = localStorage.getItem(PRIVACY_ACCEPTED_KEY);
    if (!privacyAccepted) {
      setShowPrivacyModal(true);
    }
  }, []);

  const handleAcceptPrivacy = () => {
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, new Date().toISOString());
    setShowPrivacyModal(false);
  };

  const handleShowPrivacy = () => {
    setShowPrivacyModal(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case "time-record":
        return (
          <CreateTimeRecord
            credentials={{ email: userData.email, password: userData.password }}
            onBack={() => setCurrentView("menu")}
          />
        );
      case "incident":
        return (
          <CreateIncident
            onBack={() => setCurrentView("menu")}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "change-request":
        return (
          <CreateChangeRequest
            onBack={() => setCurrentView("menu")}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "monthly-report":
        return (
          <MonthlyReport
            onBack={() => setCurrentView("menu")}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "monthly-signature":
        return (
          <MonthlySignature
            onBack={() => setCurrentView("menu")}
            userEmail={userData.email}
            userPassword={userData.password}
          />
        );
      case "settings":
        return (
          <Settings
            email={userData.email}
            password={userData.password}
            onBack={() => setCurrentView("menu")}
          />
        );
      case "help":
        return (
          <Help
            onBack={() => setCurrentView("menu")}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView("time-record")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Crear registro de jornada
            </button>

            <button
              onClick={() => setCurrentView("incident")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Crear incidencia
            </button>

            <button
              onClick={() => setCurrentView("change-request")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Petición de cambio de registro
            </button>

            <button
              onClick={() => setCurrentView("monthly-report")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Consultar informe mensual
            </button>

            <button
              onClick={() => setCurrentView("monthly-signature")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Firmar registros mensuales
            </button>

            <button
              onClick={() => setCurrentView("settings")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Ajustes
            </button>

            <button
              onClick={() => setCurrentView("help")}
              className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm"
            >
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
              Ayuda
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
        <div className="flex justify-end mb-4">
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
            Cerrar sesión
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="space-y-3 pb-6 pt-6 px-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">
              Registro de jornada
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
