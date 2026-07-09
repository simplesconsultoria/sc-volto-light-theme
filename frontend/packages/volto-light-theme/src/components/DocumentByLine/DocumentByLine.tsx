/**
 * DocumentByLine component.
 * @module components/DocumentByLine/DocumentByLine
 */
import { Container } from '@plone/components';
import FormattedDate from '@plone/volto/components/theme/FormattedDate/FormattedDate';
import { FormattedMessage } from 'react-intl';
import type { Content } from '@plone/types';

type Author = {
  fullname: string;
};

type DocumentByLineProps = {
  content: Content;
  showModified: boolean;
  showPublished: boolean;
  showAuthor: boolean;
};

function authorsInfo(content: Content): Author[] {
  const creators = content.creators ?? [];
  const authors = (content['@components']?.['authors'] as Author[]) ?? [];
  if (authors.length === 0) {
    return creators.map((creator) => ({ fullname: creator }));
  }
  return authors;
}

const DocumentByLine = ({
  content,
  showModified,
  showPublished,
  showAuthor,
}: DocumentByLineProps) => {
  const authors = authorsInfo(content);
  const { effective, modified } = content;
  const displayAuthor = showAuthor && authors.length > 0;
  const displayModified = showModified && Boolean(modified);
  const displayPublished = showPublished && Boolean(effective);
  return (
    <Container className={'documentByLine'}>
      {displayPublished && (
        <Container className={'info effective'}>
          <FormattedMessage id="effective" defaultMessage="Publicado" />
          : <FormattedDate date={effective} />
        </Container>
      )}
      {displayModified && (
        <Container className={'info modified'}>
          <FormattedMessage
            id="last_modified"
            defaultMessage="Última Modificação"
          />
          : <FormattedDate date={modified} />
        </Container>
      )}
      {displayAuthor && (
        <Container className={'info author'}>
          <FormattedMessage id="author" defaultMessage="Por" />:{' '}
          {authors &&
            authors.map((author, i) => (
              <span className={'name'} key={i}>
                {author.fullname}
              </span>
            ))}
        </Container>
      )}
    </Container>
  );
};

export default DocumentByLine;
