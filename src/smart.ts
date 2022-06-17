import { DefaultFormatter, DefaultSource } from './extensions';
import { SmartSettings } from './settings';
import { SmartFormatter } from './smart-formatter';
import { Argument } from './types';

export function format(format: string, ...args: Argument[]): string {
  return defaultFormatter.format(format, ...args);
}

const defaultFormatter = createDefaultSmartFormat();

function createDefaultSmartFormat(smartSettings?: SmartSettings): SmartFormatter {
  return new SmartFormatter(smartSettings)
    .addExtensions(new DefaultSource())
    .addExtensions(new DefaultFormatter());
}
