import { SmartFormatter } from '../../src';
import { DefaultFormatter, DefaultSource } from '../../src/extensions';

const smart = new SmartFormatter()
  .addExtensions(new DefaultSource())
  .addExtensions(new DefaultFormatter());

test('call with nonnumeric placeholder should fail', () => {
  const format = () => smart.format('{a}', 0);
  expect(format).toThrow('No source extension could handle the selector named "a"');
});

test('call with numeric placeholder should succeed', () => {
  const result = smart.format('{0}', 999);
  expect(result).toBe('999');
});
