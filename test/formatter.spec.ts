import { createDefaultSmartFormat, format } from '../src';
import { FormatDelegate } from '../src/format-delegate';
import { FormattingException } from '../src/formatting-exception';
import { SmartSettings } from '../src/settings';

const errorArg = new FormatDelegate((_) => { throw new Error('ERROR!') });

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

test('formatter throws exceptions', () => {
  const settings = new SmartSettings();
  settings.formatter.errorAction = 'throwError';
  
  const formatter = createDefaultSmartFormat(settings);
  
  const fn = () => formatter.format('--{0}--', errorArg);
  expect(fn).toThrow(FormattingException);
});

test('formatter outputs exceptions', () => {
  const settings = new SmartSettings();
  settings.formatter.errorAction = 'outputErrorInResult';
  
  const formatter = createDefaultSmartFormat(settings);
  
  expect(formatter.format('--{0}--{0:ZZZZ}--', errorArg)).toBe('--ERROR!--ERROR!--');
});

test('formatter ignores exceptions', () => {
  const settings = new SmartSettings();
  settings.formatter.errorAction = 'ignore';
  
  const formatter = createDefaultSmartFormat(settings);
  
  expect(formatter.format('--{0}--{0:ZZZZ}--', errorArg)).toBe('------');
});

test('formatter maintains tokens', () => {
  const settings = new SmartSettings();
  settings.formatter.errorAction = 'maintainTokens';
  
  const formatter = createDefaultSmartFormat(settings);
  
  expect(formatter.format('--{0}--{0:ZZZZ}--', errorArg)).toBe('--{0}--{0:ZZZZ}--');
});
