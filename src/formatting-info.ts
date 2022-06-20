import { FormatDetails } from './format-details';
import { FormattingException } from './formatting-exception';
import { IFormattingInfo, ISelectorInfo } from './interfaces';
import { Format, FormatItem, Placeholder, Selector } from './parsing';
import { FormattingInfoInitializeOptions } from './types';

export class FormattingInfo implements IFormattingInfo, ISelectorInfo {
  private _parent?: FormattingInfo;
  private _formatDetails: FormatDetails;
  private _format?: Format;

  /**
   * Creates a new class instance, that contains fields and methods which are necessary for formatting.
   * @param options 
   */
  public initialize(options: FormattingInfoInitializeOptions): void {
    const { parent, formatDetails, format, placeholder, currentValue } = options;

    if (placeholder) {
      this.initializeByPlaceholder(parent, formatDetails, placeholder, currentValue);
    } else {
      if (!format) {
        throw new Error('format or placeholder is required.');
      }

      this.initializeByFormat(parent, formatDetails, format, currentValue);
    }
  }

  /**
   * Creates a new class instance, that contains fields and methods which are necessary for formatting.
   * @param parent 
   * @param formatDetails 
   * @param format 
   * @param currentValue 
   */
  private initializeByFormat(
    parent: FormattingInfo | undefined,
    formatDetails: FormatDetails,
    format: Format,
    currentValue?: any,
  ): void {
    this._parent = parent;
    this.currentValue = currentValue;
    this._formatDetails = formatDetails;
    this._format = format;
    if (parent) {
      this.alignment = parent.alignment;
    } else if (format.parentPlaceholder) {
      this.alignment = format.parentPlaceholder.alignment;
    }
  }

  /**
   * Creates a new class instance, that contains fields and methods which are necessary for formatting.
   * @param parent 
   * @param formatDetails 
   * @param placeholder 
   * @param currentValue 
   */
  private initializeByPlaceholder(
    parent: FormattingInfo | undefined,
    formatDetails: FormatDetails,
    placeholder: Placeholder,
    currentValue?: any,
  ): void {
    this._parent = parent;
    this._formatDetails = formatDetails;
    this.placeholder = placeholder;
    this._format = placeholder.format;
    this.currentValue = currentValue;
    // inherit alignment
    this.alignment = placeholder.alignment;
  }

  /**
   * Gets the parent FormattingInfo.
   */
  public get parent(): FormattingInfo | undefined {
    return this._parent;
  }

  /**
   * Gets or sets the Parsing.Selector.
   */
  public selector?: Selector;

  /**
   * Gets the FormatDetails.
   */
  public get formatDetails(): FormatDetails {
    return this._formatDetails;
  }

  /**
   * Gets or sets the current value.
   */
  public currentValue?: any;

  /**
   * Gets the Placeholder.
   */
  public placeholder?: Placeholder;

  /**
   * Gets the Alignment of the current Placeholder,
   * or - if this is null - the Alignment
   * of any parent IFormattingInfo that is not zero.
   */
  public alignment: number;

  /**
   * Gets the Format.
   */
  public get format(): Format | undefined {
    return this._format;
  }

  /**
   * Gets the list of child FormattingInfos created by this instance.
   */
  public children: FormattingInfo[] = [];
  
  /**
   * Writes the string parameter to the Output.IOutput
   * and takes care of alignment.
   * @param text The string to write to the Output.IOutput
   */
  public write = (text: string): void => {
    if (this.alignment > 0) {
      this.preAlign(text.length);
    }

    this.formatDetails.output.write(text, this);

    if (this.alignment < 0) {
      this.postAlign(text.length);
    }
  }

  /**
   * Creates a child IFormattingInfo from the current IFormattingInfo instance
   * and invokes formatting with SmartFormatter and with the child as parameter.
   * @param {Format} format The Format to use.
   * @param value The value for the item in the format.
   */
  public formatAsChild = (format: Format, value?: any): void => {
    const nestedFormatInfo = this.createChild(format, value);
    // recursive method call
    this.formatDetails.formatter.formatByFormattingInfo(nestedFormatInfo);
  }

  /**
   * Creates a new FormattingException.
   * @param {String} issue The text which goes to the message.
   * @param {FormatItem} problemItem The FormatItem which caused the problem.
   * @param {Number} startIndex The start index in the input format string.
   * @returns {FormattingException}
   */
  public formattingException = (issue: string, problemItem?: FormatItem, startIndex?: number): FormattingException => {
    problemItem ??= this.format;
    startIndex ??= -1;
    if (startIndex === -1) {
      startIndex = problemItem?.startIndex ?? -1;
    }
    return new FormattingException(issue, startIndex, problemItem);
  }

  /**
   * Gets the (raw) text of the Parsing.Selector.
   */
  public get selectorText(): string {
    return this.selector?.rawText ?? '';
  }

  /**
   * Gets index of the Parsing.Selector in the selector list.
   */
  public get selectorIndex(): number {
    return this.selector?.selectorIndex ?? -1;
  }

  /**
   * Gets the operator string of the Parsing.Selector (e.g.: comma, dot).
   */
  public get selectorOperator(): string {
    return this.selector?.operator ?? '';
  }

  /**
   * Gets the result after an ISource has assigned a value.
   */
  public result?: any;

  /**
   * Gets the result after an ISource has assigned a value.
   * @param format 
   * @param value 
   */
  public createChild(format: Format, value?: any): FormattingInfo;

  /**
   * Creates a child IFormattingInfo from the current IFormattingInfo instance for a Placeholder.
   * @param {Placeholder} placeholder The Placeholder used for creating a child IFormattingInfo.
   * @returns {IFormattingInfo} The child IFormattingInfo.
   */
  public createChild(placeholder: Placeholder): FormattingInfo;
  
  /**
   * overload
   * @param formatItem 
   * @param value 
   * @returns 
   */
  public createChild(formatItem: Placeholder | Format, value?: any): FormattingInfo {
    const fi = new FormattingInfo();
    if (formatItem instanceof Placeholder) {
      fi.initialize({ parent: this, formatDetails: this.formatDetails, placeholder: formatItem, currentValue: this.currentValue });
    } else {
      fi.initialize({ parent: this, formatDetails: this.formatDetails, format: formatItem, currentValue: value });
    }
    this.children.push(fi);
    return fi;
  }

  private preAlign(textLength: number): void {
    const filler = this.alignment - textLength;
    if (filler > 0) {
      const {
        formatter: {
          alignmentFillCharacter = ' ',
        }
      } = this.formatDetails.settings;
      this.formatDetails.output.write(String.prototype.padEnd(filler, alignmentFillCharacter), this);
    }
  }

  private postAlign(textLength: number): void {
    const filler = -this.alignment - textLength;
    if (filler > 0) {
      const {
        formatter: {
          alignmentFillCharacter = ' ',
        }
      } = this.formatDetails.settings;
      this.formatDetails.output.write(String.prototype.padStart(filler, alignmentFillCharacter), this);
    }
  }
}
