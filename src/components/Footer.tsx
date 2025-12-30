import React from "react";

interface FooterProps {
  onShowPrivacy?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPrivacy }) => {
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
              Política de Privacidad
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
          Información RGPD
        </a>
        <span>·</span>
        <a
          href="https://www.openjornada.es/legal/aviso-legal"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 transition-colors underline"
        >
          Aviso Legal
        </a>
      </div>
      <p className="mt-2">
        © {currentYear} OpenJornada · Licencia AGPL-3.0
      </p>
    </footer>
  );
};

export default Footer;
