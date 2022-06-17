# smtfmt

[![NPM Version][npm-image]][npm-url]

Utilities for formatting and printing Strings.

smtfmt is a port of [SmartFormat.NET](https://github.com/axuno/SmartFormat).

## Installing

Install `smtfmt` using `npm`:

```bash
npm install --save smtfmt
```

Or `yarn`:

```bash
yarn add smtfmt
```

## Examples

JavaScript:

```javascript
const { fromat } = require('smtfmt');

format('Hello');                   // -> Hello
format('Hello, {0}!', 'World');    // -> Hello, World!
format('The number is {0}', 1);    // -> The number is 1
format('{0} {1}', 1, 2);           // -> 1 2
```

TypeScript:

```typescript
import { fromat } from 'smtfmt';

format('Hello');                   // -> Hello
format('Hello, {0}!', 'World');    // -> Hello, World!
format('The number is {0}', 1);    // -> The number is 1
format('{0} {1}', 1, 2);           // -> 1 2
```

[npm-image]: https://img.shields.io/npm/v/smtfmt.svg
[npm-url]: https://npmjs.org/package/smtfmt
