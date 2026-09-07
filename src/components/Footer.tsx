import React from "react";
import { useTranslation } from "react-i18next";

interface FooterProps {
  onShowPrivacy?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPrivacy }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 pb-4 text-center text-xs text-gray-500">
      <div className="space-x-3">
        {onShowPrivacy && (
          <>
            <button
              onClick={onShowPrivacy}
              className="hover:text-gray-700 transition-colors underline"
            >
              {t("footer.privacy")}
            </button>
            <span>·</span>
          </>
        )}
        <a
          href="https://www.openjornada.es/legal/privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 transition-colors underline"
        >
          {t("footer.gdprInfo")}
        </a>
        <span>·</span>
        <a
          href="https://www.openjornada.es/legal/aviso-legal"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 transition-colors underline"
        >
          {t("footer.legal")}
        </a>
      </div>
      <p className="mt-2">
        {t("footer.copyright", { year: currentYear })}
      </p>
    </footer>
  );
};

export default Footer;
