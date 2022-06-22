import { IFormattable } from './interfaces';

/**
 * This class wraps a delegate (callback), allowing it to be used as a parameter
 * to any string-formatting method
 * @example
 * const formatDelegate = new FormatDelegate((text) => {
 *  return htmlActionLink(text, 'SomeAction');
 * });
 * const textWithLink = format('Please click on {0:this link}.', formatDelegate);
 */
export class FormatDelegate implements IFormattable {
  /**
   * Creates a new instance of a FormatDelegate.
   * @param getFormat 
   */
  constructor(
    private readonly getFormat: (format: string | undefined) => string
  ) { }

  public toString(format: string | undefined): string {
    return (this.getFormat && this.getFormat(format)) ?? '';
  }
}
