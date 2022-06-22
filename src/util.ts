import { IFormattable, IFormatter, ISource } from './interfaces';
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

export function isFormattable(obj: any): obj is IFormattable {
  return isObject(obj) && 'toString' in obj && getFunctionArgNames(obj.toString).includes('format');
}

function isObject(obj: any): boolean {
  return typeof obj === 'object';
}

function isFunction(fn: any): boolean {
  return typeof fn === 'function';
}

const fnRegx = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
const classFnRegx = /^[^\(]*\(\s*([^\)]*)\)/m;
const argSplitRegx = /,/;
const argRegx = /^\s*(_?)(.+?)\1\s*$/;
const commentsRegx = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function getFunctionArgNames(fn: any): string[] {
  const args: string[] = [];

  if (isFunction(fn)) {
    const fnStr = fn.toString().replace(commentsRegx, '');
    const argDecl = fnStr.match(fnRegx) ?? fnStr.match(classFnRegx);
    if (argDecl === null) {
      return args;
    }

    for (const arg of argDecl[1].split(argSplitRegx)) {
      args.push(arg.replace(argRegx, (_: string, _1: string, name: string) => name));
    }
  }

  return args;
}
