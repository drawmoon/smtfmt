import { Debug as debug } from '../debug';
import { IFormatter, IFormattingInfo } from '../interfaces';
import { isFormattable } from '../util';

/**
 * The default IFormatter implementation.
 */
export class DefaultFormatter implements IFormatter {
  public name = 'd';

  public canAutoDetect = true;

  public tryEvaluateFormat = (formattingInfo: IFormattingInfo): boolean => {
    debug('evaluates the format on default formatter: %O', formattingInfo);

    const format = formattingInfo.format;
    const current = formattingInfo.currentValue;

    // If the format has nested placeholders, we process those first
    // instead of formatting the item.
    if (format?.hasNested === true) {
      formattingInfo.formatAsChild(format, current);
      return true;
    }

    let result: string | undefined = undefined;
    // implemented IFormattable
    if (isFormattable(current)) {
      const formatText = format?.toString();
      result = current.toString(formatText);
    } else if (typeof current === 'string') {
      result = current;
    } else {
      result = current && String(current);
    }
    
    // Output the result:
    formattingInfo.write(result ?? '');

    return true;
  }
}
