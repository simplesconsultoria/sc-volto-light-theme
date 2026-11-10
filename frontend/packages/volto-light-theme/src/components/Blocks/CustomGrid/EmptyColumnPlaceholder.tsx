import React from 'react';
import { Icon } from '@plone/volto/components';
import BlockChooser from '@plone/volto/components/manage/BlockChooser/BlockChooser';
import { useDetectClickOutside } from '@plone/volto/helpers/Utils/useDetectClickOutside';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';
import { Button, Ref } from 'semantic-ui-react';
import addBlockSVG from '@plone/volto/icons/circle-plus.svg';
import config from '@plone/volto/registry';

// Empty Column Placeholder with Block Chooser
const EmptyColumnPlaceholder = ({
  onAddBlock,
}: {
  onAddBlock: (type: string) => void;
}) => {
  const [isOpenMenu, setOpenMenu] = React.useState(false);

  const blockChooserRef = useDetectClickOutside({
    onTriggered: () => setOpenMenu(false),
    triggerKeys: ['Escape'],
  });

  const [referenceElement, setReferenceElement] =
    React.useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(
    null,
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
    modifiers: [
      { name: 'offset', options: { offset: [0, -30] } },
      { name: 'flip', options: { fallbackPlacements: ['right', 'top-start'] } },
    ],
  });

  return (
    <div className="custom-grid-empty-placeholder">
      <div className="placeholder-content">
        <p>Add a new block</p>
        <Ref innerRef={setReferenceElement as any}>
          <Button
            icon
            basic
            title="Add block"
            className="add-block-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setOpenMenu(true);
            }}
          >
            <Icon name={addBlockSVG} size="24px" />
          </Button>
        </Ref>
        {isOpenMenu
          ? createPortal(
              <div
                ref={setPopperElement as any}
                style={styles.popper as any}
                {...attributes.popper}
                className="container-chooser-wrapper"
              >
                <BlockChooser
                  onMutateBlock={(id: string, value: any) => {
                    setOpenMenu(false);
                    onAddBlock(value['@type']);
                  }}
                  currentBlock=""
                  showRestricted={false}
                  blocksConfig={config.blocks.blocksConfig}
                  ref={blockChooserRef}
                />
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
};

export default EmptyColumnPlaceholder;
