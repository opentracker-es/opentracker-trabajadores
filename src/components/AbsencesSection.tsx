import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Company } from "../types";
import AbsenceBalance from "./AbsenceBalance";
import CreateAbsenceRequest from "./CreateAbsenceRequest";
import MyAbsences from "./MyAbsences";
import TeamCalendar from "./TeamCalendar";

interface AbsencesSectionProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
  /** Empresas del trabajador con el módulo de ausencias activo (gating ya aplicado). */
  companies: Company[];
}

type SubView = "menu" | "create" | "list" | "calendar";

const AbsencesSection: React.FC<AbsencesSectionProps> = ({
  onBack,
  userEmail,
  userPassword,
  companies,
}) => {
  const { t } = useTranslation();
  const [subView, setSubView] = useState<SubView>("menu");
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    companies[0]?.id ?? "",
  );
  const [balanceRefresh, setBalanceRefresh] = useState(0);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const backToMenu = () => setSubView("menu");

  const handleBalanceRefresh = () => setBalanceRefresh((n) => n + 1);
  const handleSelectCompany = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCompanyId(e.target.value);

  const SUB_BUTTON_CLASS =
    "w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg flex items-center px-6 text-base font-medium transition-colors shadow-sm";

  if (subView === "create") {
    return (
      <CreateAbsenceRequest
        onBack={backToMenu}
        userEmail={userEmail}
        userPassword={userPassword}
        companyId={selectedCompanyId}
        companyName={selectedCompany?.name}
        onCreated={handleBalanceRefresh}
      />
    );
  }

  if (subView === "list") {
    return (
      <MyAbsences
        onBack={backToMenu}
        userEmail={userEmail}
        userPassword={userPassword}
        companyId={selectedCompanyId}
        onNewRequest={() => setSubView("create")}
      />
    );
  }

  if (subView === "calendar") {
    return (
      <TeamCalendar
        onBack={backToMenu}
        userEmail={userEmail}
        userPassword={userPassword}
        companyId={selectedCompanyId}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
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

      {companies.length > 0 && (
        <div>
          <label
            htmlFor="absence-company"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("common.company")}
          </label>
          <select
            id="absence-company"
            value={selectedCompanyId}
            onChange={handleSelectCompany}
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCompanyId && (
        <AbsenceBalance
          userEmail={userEmail}
          userPassword={userPassword}
          companyId={selectedCompanyId}
          refreshKey={balanceRefresh}
        />
      )}

      <div className="space-y-4">
        <button
          onClick={() => setSubView("create")}
          className={SUB_BUTTON_CLASS}
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
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t("absences.menu.create")}
        </button>

        <button
          onClick={() => setSubView("list")}
          className={SUB_BUTTON_CLASS}
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          {t("absences.menu.list")}
        </button>

        <button
          onClick={() => setSubView("calendar")}
          className={SUB_BUTTON_CLASS}
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
              d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65"
            />
          </svg>
          {t("absences.menu.calendar")}
        </button>
      </div>
    </div>
  );
};

export default AbsencesSection;
