import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createIntl } from 'react-intl';
import type { JSONSchema } from '@plone/types';
import installBlocks from '../../config/blocks';

const blocksDir = path.dirname(fileURLToPath(import.meta.url));

// Register the blocks the same way the add-on does, so the tests read the
// block configuration that Volto serves through `@blocks-schema`.
const config: any = {
  blocks: { blocksConfig: {}, themes: [], widths: [] },
  settings: {},
};
installBlocks(config);
const registry: Record<string, any> = config.blocks.blocksConfig;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

/** Split a `*.block.md` file into its frontmatter and its Markdown. */
function readDocs(folder: string, file = 'docs.block.md') {
  const text = readFileSync(path.join(blocksDir, folder, file), 'utf8');
  return {
    frontmatter: text.match(FRONTMATTER)?.[1] ?? '',
    markdown: text.replace(FRONTMATTER, '').trim(),
  };
}

/** Resolve a block's schema with the arguments `@blocks-schema` passes. */
function resolveSchema(block: any, variation?: string): JSONSchema {
  const intl = createIntl({ locale: 'en', messages: {}, onError: () => {} });
  const data = variation
    ? { '@type': block.id, variation }
    : { '@type': block.id };
  return block.blockSchema({ data, intl, props: { data } });
}

/** The keys an example may use: the schema fields, plus `variation` for a block that has them. */
function knownKeys(block: any, schema: JSONSchema): string[] {
  return [
    '@type',
    ...(block.variations ? ['variation'] : []),
    ...Object.keys(schema.properties ?? {}),
  ];
}

function jsonExamples(markdown: string) {
  return [...markdown.matchAll(/```json\n([\s\S]*?)\n```/g)].map(([, json]) =>
    JSON.parse(json),
  );
}

const BLOCK_FOLDERS: Record<string, string> = {
  documentByline: 'DocumentByLine',
  mainImageBlock: 'MainImageBlock',
  heroBlock: 'HeroBlock',
  quoteBlock: 'QuoteBlock',
  customGrid: 'CustomGrid',
  eventMetadata: 'EventMetadata',
};

describe.each(Object.entries(BLOCK_FOLDERS))('%s docs', (key, folder) => {
  const block = registry[key];
  const { frontmatter, markdown } = readDocs(folder);
  const schema = resolveSchema(block);
  const examples = jsonExamples(markdown);

  it('is registered under its own id', () => {
    expect(block.id).toBe(key);
  });

  it('names the block by the id the registry keys it by', () => {
    expect(frontmatter).toContain(`block: ${block.id}`);
  });

  it('opens with a summary paragraph, not a heading', () => {
    const summary = markdown.split(/\n\s*\n/)[0];
    expect(summary).not.toMatch(/^#/);
    expect(summary.length).toBeGreaterThan(20);
  });

  it('nests its headings below the one the endpoint adds', () => {
    expect(markdown).not.toMatch(/^#{1,2} /m);
  });

  it('explains every field of the schema', () => {
    for (const field of Object.keys(schema.properties ?? {})) {
      expect(markdown).toContain(`- \`${field}\`: `);
    }
  });

  it('has a minimal example and one using the fields', () => {
    expect(examples).toContainEqual({ '@type': block.id });
    expect(examples.flatMap(Object.keys)).toEqual(
      expect.arrayContaining(Object.keys(schema.properties ?? {})),
    );
  });

  it('only has examples that are data for this block', () => {
    const known = knownKeys(block, schema);
    for (const example of examples) {
      expect(example['@type']).toBe(block.id);
      expect(known).toEqual(expect.arrayContaining(Object.keys(example)));
    }
  });
});

describe('heroBlock variation docs', () => {
  const hero = registry.heroBlock;
  const files = readdirSync(path.join(blocksDir, 'HeroBlock'))
    .filter((file) => file.endsWith('.block.md') && file !== 'docs.block.md')
    .map((file) => file.replace('.block.md', ''))
    .sort();

  it('has a docs file for each variation of the block', () => {
    const configured = (hero.variations ?? []).map((v: any) => v.id).sort();
    expect(files).toEqual(configured);
  });

  it.each(['flex', 'card'])('%s names the block and the variation', (id) => {
    const { frontmatter, markdown } = readDocs('HeroBlock', `${id}.block.md`);
    expect(frontmatter).toContain(`block: ${hero.id}`);
    expect(frontmatter).toContain(`variation: ${id}`);
    expect(markdown).not.toMatch(/^#{1,2} /m);
    const schema = resolveSchema(hero, id);
    const known = knownKeys(hero, schema);
    for (const example of jsonExamples(markdown)) {
      expect(example['@type']).toBe(hero.id);
      expect(known).toEqual(expect.arrayContaining(Object.keys(example)));
    }
  });
});
