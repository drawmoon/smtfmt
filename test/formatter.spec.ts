import { format } from '../src';

test('formatter with numeric params objects', () => {
  expect(format('ABC{0}{1}DEF', 0, 1)).toBe('ABC01DEF');
});

test('formatter with string params objects', () => {
  expect(format('Name: {0}', 'Joe')).toBe('Name: Joe');
});

test('formatter pure literal no args', () => {
  expect(format('ABC')).toBe('ABC');
});

test('formatter with undefined args', () => {
  expect(format('a{0}b{1}c', undefined, undefined)).toBe('abc');
});

test('formatter with special symbols params objects', () => {
  expect(format('Cannot be: {0}, please enter: {1}', '\\', '[a-zA-Z]')).toBe('Cannot be: \\, please enter: [a-zA-Z]');
});
