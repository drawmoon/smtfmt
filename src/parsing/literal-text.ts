import { FormatItemInitializeOptions } from '../types';
import { asSpan } from '../util';
import { FormatItem } from './format-item';

export class LiteralText extends FormatItem {
  /**
   * Initializes the LiteralText instance, representing the literal text that is found in a parsed format string.
   * @param options
   */
  public initialize(options: FormatItemInitializeOptions): void {
    super.initialize(options);
  }

  /**
   * Get the string representation of the LiteralText, with escaped characters converted.
   * Note: The Parser puts each escaped character of an input string
   * into its own LiteralText item.
   * @returns {String} The string representation of the LiteralText, with escaped characters converted.
   */
  public toString(): string {
    if (this._toStringCache) {
      return this._toStringCache;
    }

    if (this.length === 0) {
      return '';
    }

    // The buffer is only 1 character
    this._toStringCache = this.asSpan();

    return this._toStringCache;
  }

  /**
   * Get the string representation of the LiteralText, with escaped characters converted.
   * Note: The <see cref="Parser"/> puts each escaped character of an input string
   * into its own LiteralText item.
   * @returns {String} The string representation of the LiteralText, with escaped characters converted.
   */
  public asSpan(): string {
    if (this.length === 0) {
      return '';
    }

    const {
      parser: { convertCharacterStringLiterals, charLiteralEscapeChar }
    } = this.smartSettings;

    // The buffer is only for 1 character - each escaped char goes into its own LiteralText
    if (convertCharacterStringLiterals && this.baseString.slice(this.startIndex)[0] === charLiteralEscapeChar) {
      throw new Error('Not implemented');
    }

    return asSpan(this.baseString, this.startIndex, this.length);
  }
}
