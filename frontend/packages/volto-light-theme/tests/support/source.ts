/**
 * Read the package sources from tests.
 *
 * Several tests check what a stylesheet *declares* (custom properties,
 * selectors, mixins), which only the SCSS source can answer, so they read it
 * as text instead of compiling it.
 */
import fs from 'node:fs';
import path from 'node:path';

/** Absolute path of this package's `src/` directory. */
export const SRC_DIR = path.resolve(__dirname, '../../src');

/** Absolute path of the repository root (holds `backend/` and `frontend/`). */
export const REPO_ROOT = path.resolve(__dirname, '../../../../..');

/**
 * Read a file under `src/`.
 *
 * @param relPath path relative to `src/`, e.g. `theme/blocks/_banner.scss`.
 */
export function readSource(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8');
}
