import { Debug as debug } from '../debug';
import { ISelectorInfo } from '../interfaces';
import { isDigit } from '../util';
import { Source } from './source';

/**
 * Class to evaluate an index-based Selector.
 * @example
 * format('Hello, {0}!', 'World')
 */
export class DefaultSource extends Source {
  public tryEvaluateSelector = (selectorInfo: ISelectorInfo): boolean => {
    debug('evaluates the selector on default source: %O', selectorInfo);

    const { selectorText : selector, formatDetails, selectorIndex, selectorOperator } = selectorInfo;

    if (isDigit(selector) && selectorIndex === 0 && selectorOperator === '') {
      const selectorValue = parseInt(selector);

      if (selectorValue < formatDetails.originalArgs.length) {
        selectorInfo.result = formatDetails.originalArgs[selectorValue];
        return true;
      }
    }

    return false;
  }
}
