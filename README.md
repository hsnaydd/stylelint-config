# stylelint-config

> Shareable stylelint config for CSS and SCSS, with Prettier formatting and property ordering.

Opinionated rules for writing consistent CSS and SCSS: code quality checks, Prettier-based formatting and declaration ordering via `stylelint-order`. Works for plain CSS as well as SCSS projects.

> **Migrating from `@atolye15/stylelint-config`?** This package is its continuation under a new name. Replace the package in your `package.json` and update `extends` to `@hsnaydd/stylelint-config`. The rules are unchanged and the version numbers continue from where they left off.

## Installation

```console
pnpm add -D @hsnaydd/stylelint-config postcss prettier stylelint

# Or with npm:

npm install @hsnaydd/stylelint-config postcss prettier stylelint --save-dev

# Or with yarn:

yarn add @hsnaydd/stylelint-config postcss prettier stylelint --dev
```

_`@hsnaydd/stylelint-config` does not install PostCSS, Prettier or Stylelint for you. You must install these yourself._

## Usage

Set your stylelint config to:

```json
{
  "extends": "@hsnaydd/stylelint-config"
}
```

### Extending the config

Simply add a `"rules"` key to your config and add your overrides there.

For example, to allow `!important` and named colors:

```json
{
  "extends": "@hsnaydd/stylelint-config",
  "rules": {
    "declaration-no-important": null,
    "color-named": null
  }
}
```

## [Changelog](https://github.com/hsnaydd/stylelint-config/releases)

## [License](LICENSE)
