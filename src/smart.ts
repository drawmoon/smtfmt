import { DefaultFormatter, DefaultSource } from './extensions';
import { SmartSettings } from './settings';
import { SmartFormatter } from './smart-formatter';
import { FormatArgument } from './types';

/**
 * Replaces the format items in the specified format string with the string representation or the corresponding object.
 * @param {String} format 
 * @param {FormatArgument} args 
 * @returns {String}
 */
export function format(format: string, ...args: FormatArgument[]): string {
  return defaultFormatter.format(format, ...args);
}

const defaultFormatter = createDefaultSmartFormat();

/**
 * Creates a new SmartFormatter instance with core extensions registered.
 * For optimized performance, create a SmartFormatter instance and register the
 * particular extensions that are really needed.
 * @param {SmartSettings} smartSettings The SmartSettings to use, or undefined for default settings.
 * @returns {SmartFormatter} A SmartFormatter with core extensions registered
 */
export function createDefaultSmartFormat(smartSettings?: SmartSettings): SmartFormatter {
  return new SmartFormatter(smartSettings)
    .addExtensions(new DefaultSource())
    .addExtensions(new DefaultFormatter());
}
