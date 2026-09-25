import { Container } from '@plone/components';
import Copyright from '@kitconcept/volto-light-theme/components/Footer/slots/Copyright';
import Logo from '@kitconcept/volto-light-theme/components/Logo/Logo';
import type { Content } from '@plone/types';

import { useLiveData } from '@kitconcept/volto-light-theme/helpers/useLiveData';
import type {
  SiteFooterSettings,
  SiteHeaderSettings,
} from '@kitconcept/volto-light-theme/types';
import config from '@plone/volto/registry';
import { createParagraph } from '@plone/volto-slate/utils';

// @ts-ignore
const Colophon = ({ content }: { content: Content }) => {
  const logo = useLiveData<SiteHeaderSettings['logo']>(
    content,
    'voltolighttheme.header',
    'logo',
  );

  const getValue = (value: any) => {
    // Previously this was a text field
    if (typeof value === 'string') {
      return [createParagraph(value)];
    }
    return value;
  };

  const footer_colophon_text = useLiveData<
    SiteFooterSettings['footer_colophon_text']
  >(content, 'voltolighttheme.footer', 'footer_colophon_text');

  const footer_colophon_right_text = useLiveData<any>(
    content,
    'sc.voltolighttheme.footer',
    'footer_colophon_right_text',
  );

  const RenderSlateToHtml = config.widgets.views.widget.slate_richtext;

  // Se não houver texto na direita, mantemos a estrutura padrão para ficar centralizado?
  // A classe q container colophon já tem display flex e space-between. Se tiver só um lado, vai ficar na esquerda.
  // Se quisermos manter centralizado caso não haja right_text, podemos colocar classes condicionais, ou o css já trata.

  const isCentered =
    (footer_colophon_text && !footer_colophon_right_text) ||
    (!footer_colophon_text && footer_colophon_right_text);

  return (
    <Container
      className={`q container colophon ${isCentered ? 'colophon-centered' : ''}`}
    >
      {footer_colophon_text || footer_colophon_right_text ? (
        <>
          <div className="colophon-left">
            {footer_colophon_text && (
              <RenderSlateToHtml value={getValue(footer_colophon_text)} />
            )}
          </div>
          {footer_colophon_right_text && (
            <div className="colophon-right">
              <RenderSlateToHtml value={getValue(footer_colophon_right_text)} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="powered-by">
            Powered by Plone and Volto Light Theme
          </div>
          <Copyright />
          {!logo && <Logo />}
        </>
      )}
    </Container>
  );
};

export default Colophon;
