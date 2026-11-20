import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lintFile } from './helpers.mjs';

describe('config', () => {
  for (const fileName of ['valid.css', 'valid.scss']) {
    describe(fileName, () => {
      it('loads without invalid options or deprecated rules', async () => {
        const result = await lintFile(fileName);

        assert.deepEqual(result.invalidOptionWarnings, []);
        assert.deepEqual(result.deprecations, []);
      });

      it('reports no problems', async () => {
        const result = await lintFile(fileName);

        assert.deepEqual(
          result.warnings.map((warning) => `${warning.line}:${warning.column} ${warning.text}`),
          [],
        );
      });
    });
  }
});
