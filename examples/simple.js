'use strict'

// const { fromat } = require('smtfmt');
const { format } = require('../dist');

console.log(format('Hello'));                   // -> Hello
console.log(format('Hello, {0}!', 'World'));    // -> Hello, World!
console.log(format('The number is {}', 1));     // -> The number is 1
console.log(format('{0} {1}', 1, 2));           // -> 1 2
