import { IOutput } from './interfaces';
import { Format } from './parsing';
import { SmartSettings } from './settings';
import { SmartFormatter } from './smart-formatter';
import { Argument } from './types';

/**
 * Contains extra information about the item currently being formatted.
 * These objects are not often used, so they are all wrapped up here.
 */
export class FormatDetails {
  private _formatter: SmartFormatter;
  private _originalFormat: Format;
  private _originalArgs: Argument[];
  private _provider?: any;
  private _output: IOutput;

  /**
   * The original formatter responsible for formatting this item.
   * It can be used for evaluating nested formats.
   */
  public get formatter(): SmartFormatter {
    return this._formatter;
  }

  /**
   * Gets the Format returned by the Parser.
   */
  public get originalFormat(): Format {
    return this._originalFormat;
  }

  /**
   * The original set of arguments passed to the format method.
   * These provide global-access to the original arguments.
   */
  public get originalArgs(): Argument[] {
    return this._originalArgs;
  }

  /**
   * The IFormatProvider that can be used to determine how to
   * format items such as numbers, dates, and anything else that
   * might be culture-specific.
   */
  public get provider(): any | undefined {
    return this._provider;
  }

  /**
   * Gets the IOutput where the result is written.
   */
  public get output(): IOutput {
    return this._output;
  }

  /**
   * Contains case-sensitivity and other settings.
   */
  public get settings(): SmartSettings {
    return this._formatter.settings;
  }

  /**
   * Initializes the FormatDetails instance.
   * @param {SmartFormatter} formatter 
   * @param {Format} originalFormat 
   * @param {Argument[]} originalArgs 
   * @param {IFormatProvider} provider 
   * @param {IOutput} output 
   * @returns {FormatDetails} This FormatDetails instance.
   */
  public initialize(formatter: SmartFormatter, originalFormat: Format, originalArgs: Argument[], provider: any, output: IOutput): this {
    this._formatter = formatter;
    this._originalFormat = originalFormat;
    this._originalArgs = originalArgs;
    this._provider = provider;
    this._output = output;

    return this;
  }

  /**
   * Clears all internal objects.
   */
  public clear(): void {
    this._provider = undefined;
  }
}
