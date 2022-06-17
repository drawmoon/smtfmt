import { IFormatter, ISource } from './interfaces';
import { FormatItem, LiteralText } from './parsing';

export function isSourceExtension(extension: ISource | IFormatter): extension is ISource {
  return 'tryEvaluateSelector' in extension;
}

export function isFormatterExtension(extension: ISource | IFormatter): extension is IFormatter {
  return 'tryEvaluateFormat' in extension;
}

export function isLiteralText(item: FormatItem): item is LiteralText {
  return item instanceof LiteralText || item.constructor.name === 'LiteralText';
}

export function isDigit(str: string): boolean {
  return !isNaN(parseFloat(str));
}

export function asSpan(str: string, start: number, length?: number): string {
  return length ? str.slice(start, start + length) : str.slice(start);
}
