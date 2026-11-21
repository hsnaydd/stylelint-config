import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lintCode, reportedRules } from './helpers.mjs';

/**
 * Each case is formatted with Prettier so that only the rules under test are
 * reported. `rules` must match the reported rules exactly.
 */
const cases = [
  {
    name: 'orders properties by the configured groups',
    file: 'a.css',
    code: '.a {\n  color: #fff;\n  display: block;\n}\n',
    rules: ['order/properties-order'],
  },
  {
    name: 'orders unspecified properties alphabetically after the configured ones',
    file: 'a.css',
    code: '.a {\n  color: #fff;\n  background-color: #000;\n}\n',
    rules: ['order/properties-order'],
  },
  {
    name: 'places declarations before nested rules',
    file: 'a.scss',
    code: '.a {\n  &:hover {\n    color: #fff;\n  }\n\n  display: block;\n}\n',
    rules: ['order/order'],
  },
  {
    name: 'requires short hex colors',
    file: 'a.css',
    code: '.a {\n  color: #ffffff;\n}\n',
    rules: ['color-hex-length'],
  },
  {
    name: 'disallows named colors',
    file: 'a.css',
    code: '.a {\n  color: red;\n}\n',
    rules: ['color-named'],
  },
  {
    name: 'disallows !important',
    file: 'a.css',
    code: '.a {\n  color: #fff !important;\n}\n',
    rules: ['declaration-no-important'],
  },
  {
    name: 'disallows border: none',
    file: 'a.css',
    code: '.a {\n  border: none;\n}\n',
    rules: ['declaration-property-value-disallowed-list'],
  },
  {
    name: 'disallows transition: all',
    file: 'a.css',
    code: '.a {\n  transition: all 0.2s;\n}\n',
    rules: ['declaration-property-value-disallowed-list'],
  },
  {
    name: 'requires numeric font weights',
    file: 'a.css',
    code: '.a {\n  font-weight: bold;\n}\n',
    rules: ['font-weight-notation'],
  },
  {
    name: 'disallows unknown units',
    file: 'a.css',
    code: '.a {\n  width: 10foo;\n}\n',
    rules: ['unit-no-unknown'],
  },
  {
    name: 'disallows ID selectors',
    file: 'a.css',
    code: '#a {\n  color: #fff;\n}\n',
    rules: ['selector-max-id'],
  },
  {
    name: 'limits compound selectors to 3',
    file: 'a.css',
    code: '.a div span p {\n  color: #fff;\n}\n',
    rules: ['selector-max-compound-selectors'],
  },
  {
    name: 'requires double-colon pseudo-elements',
    file: 'a.css',
    code: ".a:before {\n  content: '';\n}\n",
    rules: ['selector-pseudo-element-colon-notation'],
  },
  {
    name: 'disallows vendor-prefixed properties',
    file: 'a.css',
    code: '.a {\n  -webkit-transition: opacity 0.2s;\n}\n',
    rules: ['property-no-vendor-prefix'],
  },
  {
    name: 'enforces BEM class names',
    file: 'a.scss',
    code: '.myBlock {\n  color: #fff;\n}\n',
    rules: ['scss/selector-class-pattern'],
  },
  {
    name: 'resolves nested selectors for BEM class names',
    file: 'a.scss',
    code: '.block {\n  &_Element {\n    color: #fff;\n  }\n}\n',
    rules: ['scss/selector-class-pattern'],
  },
  {
    name: 'limits nesting depth to 3',
    file: 'a.scss',
    code: '.a {\n  .b {\n    .c {\n      .d {\n        .e {\n          color: #fff;\n        }\n      }\n    }\n  }\n}\n',
    rules: ['max-nesting-depth'],
  },
  {
    name: 'disallows @extend',
    file: 'a.scss',
    code: '%placeholder {\n  color: #fff;\n}\n\n.a {\n  @extend %placeholder;\n}\n',
    rules: ['at-rule-disallowed-list'],
  },
  {
    name: 'disallows @debug',
    file: 'a.scss',
    code: "@debug 'value';\n",
    rules: ['at-rule-disallowed-list'],
  },
  {
    name: 'disallows global Sass functions',
    file: 'a.scss',
    code: '.a {\n  color: darken(#fff, 10%);\n}\n',
    rules: ['scss/no-global-function-names'],
  },
  {
    name: 'enforces kebab-case Sass variables',
    file: 'a.scss',
    code: '$myVar: 1px;\n',
    rules: ['scss/dollar-variable-pattern'],
  },
  {
    name: 'enforces kebab-case mixin names',
    file: 'a.scss',
    code: '@mixin myMixin {\n  color: #fff;\n}\n',
    rules: ['scss/at-mixin-pattern'],
  },
  {
    name: 'disallows partial extensions in @use',
    file: 'a.scss',
    code: "@use 'variables.scss';\n",
    rules: ['scss/load-partial-extension'],
  },
  {
    name: 'reports formatting problems through Prettier',
    file: 'a.css',
    code: '.a { color: #fff; }\n',
    rules: ['prettier/prettier'],
  },
];

/**
 * Patterns that must stay valid, guarding against false positives.
 */
const validCases = [
  {
    name: 'allows the :global pseudo-class',
    file: 'a.scss',
    code: ':global(.is-dark) .a {\n  color: #fff;\n}\n',
  },
  {
    name: 'allows Sass interpolation in values and selectors',
    file: 'a.scss',
    code: '$size: 8px;\n\n.a-#{$size} {\n  width: calc(100% - #{$size * 2});\n}\n',
  },
  {
    name: 'allows Sass module functions',
    file: 'a.scss',
    code: "@use 'sass:math';\n\n.a {\n  width: math.div(10px, 2);\n}\n",
  },
  {
    name: 'allows private Sass members with a leading underscore or dash',
    file: 'a.scss',
    code: '$_private: 1px;\n$-private: 2px;\n',
  },
  {
    name: 'allows standard CSS nesting',
    file: 'a.css',
    code: '.a {\n  color: #fff;\n\n  &:hover {\n    color: #000;\n  }\n}\n',
  },
  {
    name: 'allows initial as a value',
    file: 'a.css',
    code: '.a {\n  color: initial;\n}\n',
  },
];

describe('rules', () => {
  for (const { name, file, code, rules } of cases) {
    it(name, async () => {
      assert.deepEqual(reportedRules(await lintCode(code, file)), rules);
    });
  }

  for (const { name, file, code } of validCases) {
    it(name, async () => {
      assert.deepEqual(reportedRules(await lintCode(code, file)), []);
    });
  }

  it('shows a readable message for BEM class name problems', async () => {
    const result = await lintCode('.myBlock {\n  color: #fff;\n}\n', 'a.scss');

    assert.deepEqual(
      result.warnings.map((warning) => warning.text),
      [
        'Expected class selector to match BEM CSS pattern https://en.bem.info/methodology/css. (scss/selector-class-pattern)',
      ],
    );
  });
});
