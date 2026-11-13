import { describe, it, expect } from 'vitest';
import install from '@simplesconsultoria/volto-light-theme/config/blocks';

/**
 * Add-ons loaded after this one still get the theme, block width and border
 * controls on their blocks, whatever pattern they use to register them.
 */

const intl = { formatMessage: ({ defaultMessage }: any) => defaultMessage };

const baseSchema = () => ({
  fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
  properties: {},
});

function makeConfig() {
  const config: any = {
    blocks: { themes: [], widths: [], blocksConfig: {} },
    settings: {},
  };
  config.blocks.blocksConfig.teaser = { id: 'teaser', title: 'Teaser' };
  install(config);
  return config;
}

/** Run a block's schemaEnhancer and report which sc-vlt controls it has. */
function controlsOf(blockConfig: any, extra: Record<string, unknown> = {}) {
  const schema = blockConfig.schemaEnhancer({
    schema: baseSchema(),
    formData: {},
    intl,
  });
  const styles = schema.properties.styles?.schema?.properties ?? {};
  return {
    theme: !!schema.properties.theme,
    width: !!styles['blockWidth:noprefix'],
    border: !!styles['--cardBorderWidth'],
    ...Object.fromEntries(
      Object.keys(extra).map((key) => [key, !!schema.properties[key]]),
    ),
  };
}

const ALL = { theme: true, width: true, border: true };

describe('sc-vlt styling on blocks from other add-ons', () => {
  it('enhances a block registered after install', () => {
    const config = makeConfig();
    config.blocks.blocksConfig.newBlock = { id: 'newBlock' };
    expect(controlsOf(config.blocks.blocksConfig.newBlock)).toEqual(ALL);
  });

  it('keeps the controls when an add-on replaces a block by spreading it', () => {
    const config = makeConfig();
    const own = (args: any) => {
      args.schema.properties.own = { title: 'Own' };
      return args.schema;
    };
    config.blocks.blocksConfig.teaser = {
      ...config.blocks.blocksConfig.teaser,
      schemaEnhancer: own,
    };
    expect(controlsOf(config.blocks.blocksConfig.teaser, { own: 1 })).toEqual({
      ...ALL,
      own: true,
    });
  });

  it('keeps the controls when an add-on sets schemaEnhancer on an existing block', () => {
    const config = makeConfig();
    config.blocks.blocksConfig.teaser.schemaEnhancer = (args: any) => {
      args.schema.properties.own = { title: 'Own' };
      return args.schema;
    };
    expect(controlsOf(config.blocks.blocksConfig.teaser, { own: 1 })).toEqual({
      ...ALL,
      own: true,
    });
  });

  it('wraps an add-on enhancer that composes the previous one only once', () => {
    const config = makeConfig();
    const prev = config.blocks.blocksConfig.teaser.schemaEnhancer;
    let calls = 0;
    config.blocks.blocksConfig.teaser.schemaEnhancer = (args: any) => {
      calls += 1;
      return prev(args);
    };
    const schema = config.blocks.blocksConfig.teaser.schemaEnhancer({
      schema: baseSchema(),
      formData: {},
      intl,
    });
    expect(calls).toBe(1);
    const fields = schema.properties.styles.schema.fieldsets[0].fields;
    // No duplicates from running the sc-vlt enhancer twice.
    expect(new Set(fields).size).toBe(fields.length);
  });

  it('keeps enhancing when an add-on replaces the whole blocksConfig', () => {
    const config = makeConfig();
    config.blocks.blocksConfig = {
      ...config.blocks.blocksConfig,
      replaced: { id: 'replaced' },
    };
    expect(controlsOf(config.blocks.blocksConfig.replaced)).toEqual(ALL);
    expect(controlsOf(config.blocks.blocksConfig.teaser)).toEqual(ALL);

    config.blocks.blocksConfig.later = { id: 'later' };
    expect(controlsOf(config.blocks.blocksConfig.later)).toEqual(ALL);
  });

  it('respects borderExcludedBlocks for blocks from other add-ons', () => {
    const config = makeConfig();
    config.settings.borderExcludedBlocks = ['noBorder'];
    config.blocks.blocksConfig.noBorder = { id: 'noBorder' };
    expect(controlsOf(config.blocks.blocksConfig.noBorder)).toEqual({
      theme: true,
      width: true,
      border: false,
    });
  });
});
