import { Container } from '@plone/components';
import type { Content } from '@plone/types';

import Logo from '@plone/volto/components/theme/Logo/Logo';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import { useLiveData } from '@kitconcept/volto-light-theme/helpers/useLiveData';
import ColumnLinks from '@kitconcept/volto-light-theme/components/Footer/ColumnLinks';

const PostFooter = ({
  content,
  location,
}: {
  content: Content;
  location?: any;
}) => {
  const footer_column_left_header = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_left_header',
  );
  const footer_column_left = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_left',
  );

  const footer_column_middle_header = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_middle_header',
  );
  const footer_column_middle = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_middle',
  );

  const footer_column_right_header = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_right_header',
  );
  const footer_column_right = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_right',
  );

  return (
    <Container className="footer-post-footer-container">
      <div className="navigation-row">
        <div className="column-brand">
          <div className="brand-logo">
            <Logo />
          </div>
          <div className="brand-info">
            <p className="brand-slogan">Aqui ficará o texto</p>
            <p className="brand-description">
              Daqui ficará o texto para o rodapé do site, com as informações
              necessárias para os usuários.
            </p>
            <SlotRenderer
              name="followUs"
              content={content}
              location={location}
            />
          </div>
        </div>

        <div className="footer-grid footer-doormat">
          {footer_column_left && (
            <div className="footer-doormat-section">
              <div className="footer-doormat-section-content">
                {footer_column_left_header && (
                  <h2>
                    <strong>{footer_column_left_header}</strong>
                  </h2>
                )}
                <ColumnLinks links={footer_column_left} />
              </div>
            </div>
          )}

          {footer_column_middle && (
            <div className="footer-doormat-section">
              <div className="footer-doormat-section-content">
                {footer_column_middle_header && (
                  <h2>
                    <strong>{footer_column_middle_header}</strong>
                  </h2>
                )}
                <ColumnLinks links={footer_column_middle} />
              </div>
            </div>
          )}

          {footer_column_right && (
            <div className="footer-doormat-section">
              <div className="footer-doormat-section-content">
                {footer_column_right_header && (
                  <h2>
                    <strong>{footer_column_right_header}</strong>
                  </h2>
                )}
                <ColumnLinks links={footer_column_right} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default PostFooter;
