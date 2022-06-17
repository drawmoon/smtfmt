import { StringOutput } from '../../src/output';

test('output of span', () => {
  const so = new StringOutput();
  so.write('text', undefined);
  expect(so.toString()).toBe('text');
});

test('output of string', () => {
  const so = new StringOutput(16);
  so.write('text', undefined);
  expect(so.toString()).toBe('text');
});
