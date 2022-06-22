import { FormatDetails } from './format-details';
import { FormattingException } from './formatting-exception';
import { Format, FormatItem, Placeholder } from './parsing';
import { SmartFormatter } from './smart-formatter';

/**
 * Converts an object to a string.
 */
export interface IFormatter {
  name: string;

  canAutoDetect: boolean;

  /**
   * Writes the current value to the output, using the specified format.
   * @param {IFormattingInfo} formattingInfo
   * @returns IF this extension cannot write the value, returns false, otherwise true.
   */
  tryEvaluateFormat(formattingInfo: IFormattingInfo): boolean;
}

/**
 * Evaluates a selector.
 */
export interface ISource {
  /**
   * Evaluates the Selector based on the ISelectorInfo.CurrentValue.
   * @param {ISelectorInfo} selectorInfo 
   * @returns {Boolean} If the Selector could be evaluated,
   *   the ISelectorInfo.Result will be set and true will be returned.
   */
  tryEvaluateSelector(selectorInfo: ISelectorInfo): boolean;
}

export interface IFormattingInfo {
  /**
   * The current value that is to be formatted.
   */
  readonly currentValue?: any;

  /**
   * This format specifies how to output the CurrentValue.
   */
  readonly format?: Format;

  /**
   * Contains all the details about the current placeholder.
   */
  readonly placeholder?: Placeholder;

  /**
   * Alignment inserts spaces into the output to ensure consistent length.
   * Positive numbers insert spaces to the left, to right-align the text.
   * Negative numbers insert spaces to the right, to left-align the text.
   * This should only work with the Default Formatter, but is optional with custom formatters.
   * This is primarily for compatibility with String.Format.
   */
  readonly alignment: number;

  /**
   * Infrequently used details, often used for debugging
   */
  readonly formatDetails: FormatDetails;

  /**
   * Writes a text to the output.
   * @param {String} text
   */
  write(text: string): void;

  /**
   * Creates a child IFormattingInfo from the current IFormattingInfo instance
   * and invokes formatting with SmartFormatter with the child as parameter.
   * @param format 
   * @param value 
   */
  formatAsChild(format: Format, value?: any): void;

  /**
   * Creates a FormattingException associated with the IFormattingInfo.Format.
   * @param {String} issue 
   * @param {FormatItem} problemItem 
   * @param {Number} startIndex 
   */
  formattingException(issue: string, problemItem?: FormatItem, startIndex?: number): FormattingException;
}

/**
 * Contains all the necessary information for evaluating a selector.
 * @example When evaluating "{Items.Length}",
 *  the CurrentValue might be Items, and the Selector would be "Length".
 *  The job of an ISource is to set CurrentValue to Items.Length.
 */
export interface ISelectorInfo {
  /**
   * The current value that is to be formatted.
   */
  readonly currentValue?: any;

  /**
   * The selector to evaluate.
   */
  readonly selectorText: string;

  /**
   * The index of the selector in a multi-part selector.
   * @example {Person.Birthday.Year} has 3 selectors,
   * and Year has a SelectorIndex of 2.
   */
  readonly selectorIndex: number;

  /**
   * The operator that came before the selector; typically "."
   */
  readonly selectorOperator: string;

  /**
   * Gets or sets the result of evaluating the selector.
   */
  result?: any;

  /**
   * Contains all the details about the current placeholder.
   */
  readonly placeholder?: Placeholder;

  /**
   * Infrequently used details, often used for debugging
   */
   readonly formatDetails: FormatDetails;
}

/**
 * Writes a string to the output.
 */
export interface IOutput {
  /**
   * Writes a string to the output.
   * @param {String} text 
   * @param {IFormattingInfo} formattingInfo 
   */
  write(text: string, formattingInfo?: IFormattingInfo): void;

  /**
   * Converts the value of this instance to a string.
   * @returns {String} String representation.
   */
  toString(): string;
}

/**
 * Initializes an ISource or IFormatter.
 */
export interface IInitializer {
  /**
   * Initializes an ISource or IFormatter.
   * The method gets called when adding an extension to a SmartFormatter instance.
   * @param smartFormatter 
   */
  initialize(smartFormatter: SmartFormatter): void;
}

/**
 * Provides functionality to format the value of an object into a string representation.
 */
export interface IFormattable {
  /**
   * Formats the value of the current instance using the specified format.
   * @param {String} format 
   * @returns {String}
   */
  toString(format: string | undefined): string;
}
