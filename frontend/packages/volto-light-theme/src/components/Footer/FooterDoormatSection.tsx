import React from 'react';
import ColumnLinks from '@kitconcept/volto-light-theme/components/Footer/ColumnLinks';

type FooterDoormatSectionProps = {
  /** Titulo da secao (opcional) */
  header?: string;
  /** Lista de links da secao */
  links: any;
};

// Secao reutilizavel do doormat do footer (coluna com titulo + links)
const FooterDoormatSection: React.FC<FooterDoormatSectionProps> = ({
  header,
  links,
}) => {
  if (!links) return null;

  return (
    <div className="footer-doormat-section">
      <div className="footer-doormat-section-content">
        {header && (
          <h2>
            <strong>{header}</strong>
          </h2>
        )}
        <ColumnLinks links={links} />
      </div>
    </div>
  );
};

export default FooterDoormatSection;
