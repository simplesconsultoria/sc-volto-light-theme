import { Button, Segment, Table } from 'semantic-ui-react';
import { useIntl } from 'react-intl';

import Icon from '@plone/volto/components/theme/Icon/Icon';
import copySVG from '@plone/volto/icons/copy.svg';
import deleteSVG from '@plone/volto/icons/delete.svg';
import pencilSVG from '@plone/volto/icons/pencil.svg';

import type { ThemeItem } from '../../../types/theme';
import { isDeletable } from '../../../helpers/themesControlpanel';
import ThemeSwatches from './ThemeSwatches';
import messages from './messages';

export type ThemesListProps = {
  /** The themes to list, in the order the backend returned them. */
  themes: ThemeItem[];
  onEdit: (theme: ThemeItem) => void;
  onDuplicate: (theme: ThemeItem) => void;
  onDelete: (theme: ThemeItem) => void;
};

/**
 * Every theme, one row each.
 *
 * The delete control is hidden for the default theme rather than disabled:
 * `isDeletable` is the single place that decides, and the backend refuses the
 * same id, so a visible-but-failing button would only promise something the
 * API will not do.
 */
const ThemesList = ({
  themes,
  onEdit,
  onDuplicate,
  onDelete,
}: ThemesListProps) => {
  const intl = useIntl();

  return (
    <Segment.Group raised>
      <Segment className="primary">
        {intl.formatMessage(messages.title)}
      </Segment>
      <Segment>
        <Table selectable compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {intl.formatMessage(messages.columnName)}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {intl.formatMessage(messages.columnId)}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {intl.formatMessage(messages.columnColours)}
              </Table.HeaderCell>
              <Table.HeaderCell textAlign="right">
                {intl.formatMessage(messages.columnActions)}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {themes.map((theme) => (
              <Table.Row key={theme.id}>
                <Table.Cell>{theme.name || theme.id}</Table.Cell>
                <Table.Cell>
                  <code>{theme.id}</code>
                </Table.Cell>
                <Table.Cell>
                  <ThemeSwatches theme={theme} />
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button
                    basic
                    icon
                    aria-label={intl.formatMessage(messages.edit)}
                    title={intl.formatMessage(messages.edit)}
                    onClick={() => onEdit(theme)}
                  >
                    <Icon name={pencilSVG} size="20px" />
                  </Button>
                  <Button
                    basic
                    icon
                    aria-label={intl.formatMessage(messages.duplicate)}
                    title={intl.formatMessage(messages.duplicate)}
                    onClick={() => onDuplicate(theme)}
                  >
                    <Icon name={copySVG} size="20px" />
                  </Button>
                  {isDeletable(theme.id) && (
                    <Button
                      basic
                      icon
                      aria-label={intl.formatMessage(messages.delete)}
                      title={intl.formatMessage(messages.delete)}
                      onClick={() => onDelete(theme)}
                    >
                      <Icon name={deleteSVG} size="20px" />
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Segment>
    </Segment.Group>
  );
};

export default ThemesList;
