import { useEffect, type RefObject } from 'react';

/**
 * Fecha um elemento (dropdown, modal, etc.) ao clicar fora dele.
 * Tambem fecha ao pressionar Escape se o elemento estiver aberto.
 *
 * @param ref - Ref do container a monitorar
 * @param onClose - Callback disparado ao clicar fora ou pressionar Escape
 * @param isActive - Quando false, os listeners nao sao registrados
 * @param extraRefs - Refs adicionais que nao devem disparar o close (ex: trigger buttons)
 */
const EMPTY_REFS: RefObject<HTMLElement>[] = [];

const useClickOutside = (
  ref: RefObject<HTMLElement>,
  onClose: () => void,
  isActive: boolean = true,
  extraRefs: RefObject<HTMLElement>[] = EMPTY_REFS,
) => {
  useEffect(() => {
    if (!isActive) return;

    // Fecha ao clicar fora de todas as refs monitoradas
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const allRefs = [ref, ...extraRefs];
      const isInside = allRefs.some(
        (r) => r.current && r.current.contains(target),
      );
      if (!isInside) {
        onClose();
      }
    };

    // Fecha ao pressionar Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [ref, onClose, isActive, extraRefs]);
};

export default useClickOutside;
