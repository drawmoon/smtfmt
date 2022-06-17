import { Debug as debug } from '../debug';
import { IFormatter, IFormattingInfo } from '../interfaces';

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
    if (typeof current === 'string') {
      formattingInfo.write(current);
      return true;
    } else {
      result = String(current);
    }
    
    // Output the result:
    formattingInfo.write(result ?? '');

    return true;
  }
}
