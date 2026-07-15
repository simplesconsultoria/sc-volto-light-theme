import React, { useEffect, useState } from 'react';
import { clearStoredComponents, storeComponent } from '../../helpers/storage';
import { listVLTComponents } from '../../helpers/components';
import type { ComponentSlot } from '@simplesconsultoria/volto-light-theme/helpers/settings';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import showcaseIcon from '@plone/volto/icons/showcase.svg';
import clearIcon from '@plone/volto/icons/clear.svg';

const Showcase: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Client only. Rendering nothing on the server *and* on the first client
  // render keeps hydration matching; the effect then reveals it. Testing for
  // `__CLIENT__` instead would make the first client render disagree with the
  // server's markup.
  const [isMounted, setIsMounted] = useState(false);
  const components = listVLTComponents();

  // config/showcase reads the stored pick back when the page boots, so the
  // reload is what actually applies it. Mutating config here as well would
  // only change this panel, leaving the header behind until a navigation.
  const selectComponent = (slot: ComponentSlot, name: string) => {
    storeComponent(slot, name);
    window.location.reload();
  };

  const resetComponents = () => {
    clearStoredComponents();
    window.location.reload();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // After every hook, so the hook order stays stable across renders.
  if (!isMounted) return null;

  return (
    <>
      <div className="vltShowcase">
        <button
          type="button"
          className="vltShowcaseTrigger"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Showcase"
          onClick={() => setIsOpen((open) => !open)}
        >
          <Icon name={showcaseIcon} size="24px" />
        </button>
      </div>

      {isOpen && (
        <>
          {/* The overlay only repeats the close button and Escape, so it is
              kept out of the accessibility tree rather than given a role. */}
          <div
            className="vltShowcaseOverlay"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="vltShowcaseContent"
            role="dialog"
            aria-modal="true"
            aria-label="Showcase"
          >
            <div className="vltShowcaseHeader">
              <h2>Showcase</h2>
              <button
                type="button"
                className="vltShowcaseClose"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
              >
                <Icon name={clearIcon} size="18px" />
              </button>
            </div>

            {(
              Object.entries(components) as [
                ComponentSlot,
                (typeof components)[ComponentSlot],
              ][]
            ).map(([slot, choices]) => (
              <div key={slot} className="vltShowcaseSlot">
                <label htmlFor={`vltShowcase-${slot}`}>{slot}</label>
                <select
                  id={`vltShowcase-${slot}`}
                  value={choices.find((choice) => choice.selected)?.name ?? ''}
                  disabled={choices.length === 0}
                  onChange={(event) =>
                    selectComponent(slot, event.target.value)
                  }
                >
                  {choices.length === 0 && (
                    <option value="">none registered</option>
                  )}
                  {choices.map((choice) => (
                    <option key={choice.name} value={choice.name}>
                      {choice.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="vltShowcaseFooter">
              <p className="vltShowcaseHint">
                Choosing a component reloads the page. Picks are kept in this
                browser only.
              </p>
              <button
                type="button"
                className="vltShowcaseReset"
                onClick={resetComponents}
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Showcase;
