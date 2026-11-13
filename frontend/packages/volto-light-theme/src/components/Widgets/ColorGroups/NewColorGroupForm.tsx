import React, { useState } from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';
import type { ColorGroup } from '../../../types/theme';
import { LayerSizingControls } from './LayerSizingControls';
import { messages } from './messages';

export interface NewColorGroupFormProps {
  /** Ids already taken, to refuse duplicates. */
  existingIds: string[];
  onAdd: (group: ColorGroup) => void;
}

type Draft = Omit<ColorGroup, 'id' | 'name'> & { id: string; name: string };

/** Starting values of a new group: the default palette, no image layer. */
const EMPTY_DRAFT: Draft = {
  id: '',
  name: '',
  font_family: 'Inter, sans-serif',
  background_color_light: '#ffffff',
  background_color_dark: '#14171c',
  text_color_light: '#1d2129',
  text_color_dark: '#f1f3f5',
  subtext_color_light: '#4a5260',
  subtext_color_dark: '#b4bcc8',
  accent_color_light: '#1971c2',
  accent_color_dark: '#74c0fc',
  bg_image_light_desktop: '',
  bg_image_light_mobile: '',
  bg_image_dark_desktop: '',
  bg_image_dark_mobile: '',
  bg_size: 'auto',
  bg_repeat: 'repeat',
  bg_position: 'center',
};

const COLOR_PAIRS: { role: string; label: MessageDescriptor }[] = [
  { role: 'background', label: messages.background },
  { role: 'text', label: messages.text },
  { role: 'subtext', label: messages.subtext },
  { role: 'accent', label: messages.accent },
];

/**
 * Turn what the editor typed into a valid group id.
 *
 * Anything but letters and digits becomes `_`: a dash would break the
 * `custom-<back>-<front>` Block Theme name the id ends up in.
 */
export const cleanGroupId = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

/** Form adding a custom Color Group to the theme being edited. */
export const NewColorGroupForm: React.FC<NewColorGroupFormProps> = ({
  existingIds,
  onAdd,
}) => {
  const intl = useIntl();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = (field: keyof Draft, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const handleAdd = () => {
    const id = cleanGroupId(draft.id);
    if (!id) {
      setErrorMsg(intl.formatMessage(messages.idRequired));
      return;
    }
    if (existingIds.includes(id)) {
      setErrorMsg(intl.formatMessage(messages.idExists, { id }));
      return;
    }
    onAdd({
      ...draft,
      id,
      name: draft.name.trim() || id.charAt(0).toUpperCase() + id.slice(1),
      font_family: draft.font_family?.trim() || EMPTY_DRAFT.font_family,
    });
    // Keep colours and sizing for the next group; clear what identifies it.
    setDraft((prev) => ({
      ...prev,
      id: '',
      name: '',
      bg_image_light_desktop: '',
    }));
    setErrorMsg(null);
  };

  return (
    <div className="add-colorgroup-card">
      <h5>+ {intl.formatMessage(messages.addColorGroup)}</h5>
      <p className="help">{intl.formatMessage(messages.addColorGroupHelp)}</p>

      {errorMsg && (
        <div className="ui error message" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="add-fields-grid">
        <div className="field-item">
          <label htmlFor="new-cg-id">
            {intl.formatMessage(messages.groupId)}:
          </label>
          <input
            id="new-cg-id"
            type="text"
            value={draft.id}
            onChange={(e) => set('id', e.target.value)}
            placeholder={intl.formatMessage(messages.groupIdPlaceholder)}
          />
        </div>
        <div className="field-item">
          <label htmlFor="new-cg-name">
            {intl.formatMessage(messages.displayName)}:
          </label>
          <input
            id="new-cg-name"
            type="text"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
          />
        </div>
        <div className="field-item">
          <label htmlFor="new-cg-font">
            {intl.formatMessage(messages.font)}:
          </label>
          <input
            id="new-cg-font"
            type="text"
            value={draft.font_family || ''}
            onChange={(e) => set('font_family', e.target.value)}
            placeholder={intl.formatMessage(messages.example, {
              example: 'Inter, sans-serif',
            })}
          />
        </div>
      </div>

      <div className="add-colors-row">
        {COLOR_PAIRS.map(({ role, label: labelMessage }) => {
          const label = intl.formatMessage(labelMessage);
          return (
            <div className="color-pair" key={role}>
              <span aria-hidden="true">
                {intl.formatMessage(messages.colorPair, { label })}:
              </span>
              {(['light', 'dark'] as const).map((mode) => {
                const field = `${role}_color_${mode}` as keyof Draft;
                const name = intl.formatMessage(messages.colorInMode, {
                  label,
                  mode: intl.formatMessage(messages[mode]),
                });
                return (
                  <input
                    key={mode}
                    type="color"
                    value={draft[field] as string}
                    onChange={(e) => set(field, e.target.value)}
                    title={name}
                    aria-label={name}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="add-image-layer-row">
        <div className="field-item">
          <label htmlFor="new-cg-img">
            {intl.formatMessage(messages.initialLayer)}:
          </label>
          <input
            id="new-cg-img"
            type="text"
            value={draft.bg_image_light_desktop || ''}
            onChange={(e) => set('bg_image_light_desktop', e.target.value)}
            placeholder={intl.formatMessage(messages.imageOrPatternPlaceholder)}
          />
        </div>

        <LayerSizingControls
          idSuffix="new"
          className="layer-controls-interactive add-layer-controls-interactive"
          size={draft.bg_size}
          repeat={draft.bg_repeat}
          position={draft.bg_position}
          onChange={set}
        />
      </div>

      <button
        type="button"
        className="ui button primary add-colorgroup-btn"
        onClick={handleAdd}
      >
        {intl.formatMessage(messages.saveNewColorGroup)}
      </button>
    </div>
  );
};
