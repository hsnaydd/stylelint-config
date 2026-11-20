import path from 'node:path';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';

export const configPath = fileURLToPath(new URL('../index.js', import.meta.url));
export const fixturesDir = fileURLToPath(new URL('./fixtures/', import.meta.url));

const config = { extends: configPath };

/**
 * Lints a fixture file and returns its stylelint result.
 */
export async function lintFile(fileName) {
  const { results } = await stylelint.lint({
    files: path.join(fixturesDir, fileName),
    config,
  });

  return results[0];
}

/**
 * Lints a code snippet as if it lived in the fixtures directory, so the
 * repository's Prettier config applies to it, and returns its stylelint result.
 */
export async function lintCode(code, fileName) {
  const { results } = await stylelint.lint({
    code,
    codeFilename: path.join(fixturesDir, fileName),
    config,
  });

  return results[0];
}

/**
 * Returns the sorted, unique rule names reported in a stylelint result.
 */
export function reportedRules(result) {
  return [...new Set(result.warnings.map((warning) => warning.rule))].sort();
}
