import { format } from '../src';

test('formatter with string params objects', () => {
  expect(format('Hello, {0}!', 'World')).toBe('Hello, World!');
});

test('formatter with numeric params objects', () => {
  expect(format('{0} {1}', 1, 2)).toBe('1 2');
});

test('formatter with special symbols params objects', () => {
  expect(format('Cannot be: {0}, please enter: {1}', '\\', '[a-zA-Z]')).toBe('Cannot be: \\, please enter: [a-zA-Z]');
});
