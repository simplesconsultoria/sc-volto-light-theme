/**
 * DocumentByLine component.
 * @module components/DocumentByLine/DocumentByLine
 */
import { Container } from '@plone/components';
import VoltoFormattedDate from '@plone/volto/components/theme/FormattedDate/FormattedDate';
import { FormattedMessage } from 'react-intl';
import type { ComponentType } from 'react';
import type { Content } from '@plone/types';

// Volto's FormattedDate is untyped JS: inferred from its parameters, every
// prop would be required, although all but `date` are optional.
const FormattedDate = VoltoFormattedDate as ComponentType<{ date?: string }>;

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
      {displayAuthor && (
        <p className={'info author'}>
          <FormattedMessage id="By" defaultMessage="By" />:{' '}
          {authors &&
            authors.map((author, i) => (
              <span className={'name'} key={author.fullname || i}>
                {author.fullname}
              </span>
            ))}
        </p>
      )}
      {displayPublished && (
        <p className={'info effective'}>
          <FormattedMessage id="Published" defaultMessage="Published" />
          : <FormattedDate date={effective} />
        </p>
      )}
      {displayModified && (
        <p className={'info modified'}>
          <FormattedMessage id="Last modified" defaultMessage="Last modified" />
          : <FormattedDate date={modified} />
        </p>
      )}
    </Container>
  );
};

export default DocumentByLine;
