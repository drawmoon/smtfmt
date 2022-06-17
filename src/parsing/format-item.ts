import { SmartSettings } from '../settings';
import { FormatItemInitializeOptions } from '../types';
import { asSpan } from '../util';

/**
 * Base class that represents a substring
 * of text from a parsed format string.
 */
export class FormatItem {
  protected _toStringCache?: string;
  private _baseString: string;
  private _smartSettings = new SmartSettings();
  private _parentFormatItem?: FormatItem;

  /**
   * Gets the base format string.
   */
  public get baseString(): string {
    return this._baseString;
  }

  protected set baseString(value: string) {
    this._baseString = value;
  }

  /**
   * The end index is pointing to ONE POSITION AFTER the last character of item.
   * @example
   * Format string: {0}{1}ABC
   * Index:         012345678
   * Start index for 1st placeholder is 0, for the second it's 3, for the literal it's 6.
   * End index for the 1st placeholder is 3, for the second it's 6, for the literal it's 9.
   */
  public endIndex: number;

  /**
   * The start index is pointing to the first character of item.
   * @example
   * Format string: {0}{1}ABC
   * Index:         012345678
   * Start index for 1st placeholder is 0, for the second it's 3, for the literal it's 6.
   * End index for the 1st placeholder is 3, for the second it's 6, for the literal it's 9.
   */
  public startIndex: number;

  /**
   * Gets the result of endIndex minus startIndex.
   */
  public get length(): number {
    return this.endIndex - this.startIndex;
  }

  /**
   * The settings for formatter and parser.
   */
  public get smartSettings(): SmartSettings {
    return this._smartSettings;
  }

  protected set smartSettings(value: SmartSettings) {
    this._smartSettings = value;
  }

  /**
   * The parent FormatItem of this instance, undefined if not parent exists.
   */
  public get parentFormatItem(): FormatItem | undefined {
    return this._parentFormatItem;
  }

  /**
   * Initializes the FormatItem or the derived class.
   * @param {FormatItemInitializeOptions} options 
   */
   public initialize(options: FormatItemInitializeOptions): void {
    const { smartSettings, parent, baseString, startIndex = 0, endIndex = baseString.length } = options;

    this.smartSettings = smartSettings;
    this._parentFormatItem = parent;
    this._baseString = baseString;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }

  /**
   * Clears the FormatItem or the derived class.
   */
  public clear(): void {
    this._toStringCache = undefined;
    this._baseString = '';
    this.startIndex = 0;
    this.endIndex = 0;
    this.smartSettings = new SmartSettings();
    this._parentFormatItem = undefined;
  }

  /**
   * Retrieves the raw text that this item represents.
   */
  public get rawText(): string {
    return this.toString();
  }

  /**
   * Gets the string representation of this FormatItem.
   * @returns {String}
   */
  public toString(): string {
    return this._toStringCache ??= this.asSpan();
  }

  /**
   * Gets the string representation of this FormatItem.
   * @returns {String}
   */
  public asSpan(): string {
    return this.endIndex <= this.startIndex
      ? asSpan(this.baseString, this.startIndex)
      : asSpan(this.baseString, this.startIndex, this.length);
  }
}
