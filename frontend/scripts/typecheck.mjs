#!/usr/bin/env node
/**
 * Typecheck the frontend packages, failing only on errors in their own code.
 *
 * `tsc` follows imports into Volto core and `@kitconcept/volto-light-theme`
 * sources through the `paths` in each `tsconfig.dev.json`, and `skipLibCheck`
 * does not cover `.ts`/`.tsx` sources, so errors in those packages show up too.
 * We cannot fix them here, and TypeScript has no option to exclude a file that
 * is reached by import. This script runs `tsc`, prints every error, and counts
 * only the ones in files under `packages/` (outside any `node_modules`).
 *
 * It also fails when `tsc` exits non-zero without printing an error it can
 * parse (a broken config, a crash), so a silent failure never reads as green.
 *
 * Usage: node scripts/typecheck.mjs [package ...]
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const PACKAGES = path.join(FRONTEND, 'packages');
const DEFAULT_PACKAGES = ['volto-light-theme', 'showcase'];
const ERROR_LINE = /^(.+?)\(\d+,\d+\): error TS\d+:/;

/** True when `file` belongs to one of this repository's packages. */
function isOwn(file) {
  const relative = path.relative(PACKAGES, file);
  return (
    !relative.startsWith('..') &&
    !path.isAbsolute(relative) &&
    !relative.split(path.sep).includes('node_modules')
  );
}

/** Run `tsc` for one package and classify its errors. */
function check(pkg) {
  const cwd = path.join(PACKAGES, pkg);
  const result = spawnSync(
    'pnpm',
    ['exec', 'tsc', '--noEmit', '--pretty', 'false', '-p', 'tsconfig.dev.json'],
    { cwd, encoding: 'utf8' },
  );
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const own = [];
  const upstream = [];
  for (const line of output.split('\n')) {
    const match = ERROR_LINE.exec(line);
    if (!match) continue;
    (isOwn(path.resolve(cwd, match[1])) ? own : upstream).push(line);
  }
  const unexplained = result.status !== 0 && own.length + upstream.length === 0;
  return { pkg, output, own, upstream, unexplained, status: result.status };
}

const packages = process.argv.slice(2);
let failed = false;
for (const pkg of packages.length ? packages : DEFAULT_PACKAGES) {
  const { output, own, upstream, unexplained, status } = check(pkg);
  console.log(`== ${pkg}`);
  for (const line of own) console.log(line);
  for (const line of upstream) console.log(`[upstream, ignored] ${line}`);
  if (unexplained) {
    console.log(output.trim());
    console.log(`tsc exited ${status} without a parseable error.`);
    failed = true;
  }
  console.log(
    `${own.length} error(s) in ${pkg}, ${upstream.length} upstream ignored.`,
  );
  if (own.length) failed = true;
}
process.exit(failed ? 1 : 0);
