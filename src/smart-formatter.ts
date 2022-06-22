import { Debug as debug } from './debug';
import { getIndexToInsert } from './extensions';
import { DefaultFormatter } from './extensions/default-formatter';
import { FormatDetails } from './format-details';
import { FormattingException } from './formatting-exception';
import { FormattingInfo } from './formatting-info';
import { IFormatter, IFormattingInfo, ISource } from './interfaces';
import { StringOutput } from './output';
import { Format, FormatItem, Parser, Placeholder } from './parsing';
import { SmartSettings } from './settings';
import { FormatArgument } from './types';
import { isLiteralText, isSourceExtension } from './util';

/**
 * This class contains the Format method that constructs
 * the composite string by invoking each extension.
 */
export class SmartFormatter {
  private readonly sourceExtensions: ISource[] = [];
  private readonly formatterExtensions: IFormatter[] = [];

  /**
   * Gets the instance of the Parser />
   */
  public readonly parser: Parser;

  /**
   * Get the SmartSettings for SmartFormatter
   */
  public readonly settings: SmartSettings;

  /**
   * Creates a new instance of a SmartFormatter.
   * @param settings The SmartSettings to use, or undefined for default settings.
   */
  constructor(settings?: SmartSettings) {
    this.settings = settings ?? new SmartSettings();
    this.parser = new Parser(this.settings);
  }

  /**
   * Adds ISource or IFormatter extensions to the list of this formatter,
   * if the Type has not been added before. WellKnownExtensionTypes.sources are inserted
   * at the recommended position, all others are added at the end of the list.
   * @param {ISource | IFormatter} extensions extensions in an arbitrary order.
   * @returns {SmartFormatter} This SmartFormatter instance.
   */
  public addExtensions = (...extensions: ISource[] | IFormatter[]): this  => {
    for (const extension of extensions) {
      const currentExtensions = isSourceExtension(extension) ? this.sourceExtensions : this.formatterExtensions;
      const index = getIndexToInsert(currentExtensions, extension);
      this.insertExtension(index, extension);
    }

    return this;
  }

  /**
   * Adds the ISource or IFormatter extensions at the position of the list of this formatter,
   * if the Type has not been added before.
   * @param {Number} position The position in the <see cref="SourceExtensions"/> list where new extensions will be added.
   * @param {ISource | IFormatter} extension 
   * @returns {SmartFormatter} This SmartFormatter instance.
   */
  public insertExtension = (position: number, extension: ISource | IFormatter): this  => {
    if (isSourceExtension(extension)) {
      this.sourceExtensions.splice(position, 0, extension as ISource);
    } else {
      this.formatterExtensions.splice(position, 0, extension as IFormatter);
    }

    return this;
  }

  /**
   * Replaces one or more format items in a specified string with the string representation of a specific object.
   * @param {String} format A composite format string.
   * @param {FormatArgument[]} args The object to format.
   * @returns {String} Returns the formatted input with items replaced with their string representation.
   */
  public format = (format: string, ...args: FormatArgument[]): string => {
    return this.formatWithFormatProvider(undefined, format, ...args);
  }

  /**
   * Replaces one or more format items in a specified string with the string representation of a specific object.
   * @param {IFormatProvider} provider The IFormatProvider to use.
   * @param {String} format A composite format string.
   * @param {FormatArgument[]} args The object to format.
   * @returns {String} Returns the formatted input with items replaced with their string representation.
   */
  public formatWithFormatProvider = (provider: any, format: string, ...args: FormatArgument[]): string => {
    const formatParsed = this.parser.parseFormat(format); // The parser gets the Format from the pool

    const stringOutput = new StringOutput();

    const current = args.length > 0 ? args[0] : args; // The first item is the default.

    const formatDetails = new FormatDetails().initialize(this, formatParsed, args, provider, stringOutput);
    this.formatByFormatDetails(formatDetails, formatParsed, current);

    formatDetails.clear();

    return stringOutput.toString();
  }

  public formatByFormatDetails = (formatDetails: FormatDetails, format: Format, current: any): void => {
    const formattingInfo = new FormattingInfo();
    formattingInfo.initialize({ formatDetails, format, currentValue: current });

    this.formatByFormattingInfo(formattingInfo);
  }

  /**
   * Format the FormattingInfo argument.
   * @param {FormattingInfo} formattingInfo 
   */
  public formatByFormattingInfo = (formattingInfo: FormattingInfo): void => {
    // Before we start, make sure we have at least one source extension and one formatter extension:
    this.checkForExtensions();
    if (!formattingInfo.format) {
      return;
    }

    for (const item of formattingInfo.format.items) {
      if (isLiteralText(item)) {
        formattingInfo.write(item.asSpan());
        continue;
      }

      // Otherwise, the item must be a placeholder.
      const placeholder = item as Placeholder;
      const childFormattingInfo = formattingInfo.createChild(placeholder);

      try {
        // Note: If there is no selector (like {:0.00}),
        // FormattingInfo.CurrentValue is left unchanged
        this.evaluateSelectors(childFormattingInfo);
      } catch (e) {
        debug('evaluateSelectors failed');
        const errorIndex = placeholder.format?.startIndex ?? placeholder.selectors[placeholder.selectors.length - 1].endIndex;
        this.formatError(item, e, errorIndex, childFormattingInfo);
        continue;
      }

      try {
        this.evaluateFormatters(childFormattingInfo);
      } catch (e) {
        debug('evaluateFormatters failed');
        const errorIndex = placeholder.format?.startIndex ?? placeholder.selectors[placeholder.selectors.length - 1].endIndex;
        this.formatError(item, e, errorIndex, childFormattingInfo);
      }
    }
  }

  private formatError = (
    errorItem: FormatItem,
    innerException: FormattingException | Error | string | unknown,
    startIndex: number,
    formattingIndo: IFormattingInfo
  ): void => {
    debug('inner exception: %O', innerException);

    const { formatter: { errorAction } } = this.settings;

    switch (errorAction) {
      case 'ignore':
        return;
      case 'throwError':
        throw innerException instanceof FormattingException
          ? innerException
          : new FormattingException(innerException, startIndex, errorItem);
      case 'outputErrorInResult':
        const exception = innerException instanceof FormattingException
          ? innerException
          : new FormattingException(innerException, startIndex, errorItem);
        formattingIndo.formatDetails.formattingException = exception;
        formattingIndo.write(exception.issue);
        formattingIndo.formatDetails.formattingException = undefined;
        break;
      case 'maintainTokens':
        formattingIndo.write(formattingIndo.placeholder?.rawText ?? "'null'");
        break;
    }
  }

  private evaluateSelectors = (formattingInfo: FormattingInfo): void => {
    if (!formattingInfo.placeholder) {
      return;
    }

    const {
      parser: { alignmentOperator }
    } = this.settings;

    let firstSelector = true;
    for (const selector of formattingInfo.placeholder.selectors) {
      // Don't evaluate empty selectors
      // (used e.g. for Settings.Parser.NullableOperator and Settings.Parser.ListIndexEndChar final operators)
      if (selector.length === 0) {
        continue;
      }

      formattingInfo.selector = selector;
      // Do not evaluate alignment-only selectors
      if (formattingInfo.selectorOperator.length > 0 && formattingInfo.selectorOperator[0] === alignmentOperator) {
        continue;
      }

      formattingInfo.result = undefined;

      let handled = this.invokeSourceExtensions(formattingInfo);
      if (handled) {
        formattingInfo.currentValue = formattingInfo.result;
      }

      if (firstSelector) {
        firstSelector = false;
        // Handle "nested scopes" by traversing the stack:
        let parentFormattingInfo = formattingInfo;
        while (!handled && parentFormattingInfo.parent) {
          parentFormattingInfo = parentFormattingInfo.parent;
          parentFormattingInfo.selector = selector;
          parentFormattingInfo.result = undefined;
          handled = this.invokeSourceExtensions(parentFormattingInfo);
          if (handled) {
            formattingInfo.currentValue = parentFormattingInfo.result;
          }
        }
      }

      if (!handled) {
        throw formattingInfo.formattingException(`No source extension could handle the selector named "${selector.rawText}"`, selector);
      }
    }
  }

  private invokeSourceExtensions = (formattingInfo: FormattingInfo): boolean => {
    for (const sourceExtension of this.sourceExtensions) {
      const handled = sourceExtension.tryEvaluateSelector(formattingInfo);
      if (handled === true) {
        return true;
      }
    }

    return false;
  }

  /**
   * Try to get a suitable formatter.
   * @param {FormattingInfo} formattingInfo 
   */
  private evaluateFormatters = (formattingInfo: FormattingInfo): void => {
    const handled = this.invokeFormatterExtensions(formattingInfo);
    if (!handled) {
      throw formattingInfo.formattingException('No suitable Formatter could be found', formattingInfo.format);
    }
  }

  /**
   * First check whether the named formatter name exist in of the FormatterExtensions,
   * next check whether the named formatter is able to process the format.
   * @param {FormattingInfo} formattingInfo 
   * @returns {Boolean}
   */
  private invokeFormatterExtensions = (formattingInfo: FormattingInfo): boolean => {
    if (!formattingInfo.placeholder) {
      throw new Error('formattingInfo.placeholder must not be null.')
    }

    const formatterName = formattingInfo.placeholder.formatterName;
    const { stringFormatCompatibility = false } = this.settings;

    // Compatibility mode does not support formatter extensions except this one:
    if (stringFormatCompatibility) {
      return this.formatterExtensions.find(fe => fe instanceof DefaultFormatter)?.tryEvaluateFormat(formattingInfo) ?? false;
    }

    // Try to evaluate using the not empty formatter name from the format string
    if (formatterName !== '') {
      let formatterExtension: IFormatter | undefined = undefined;
      for (const fe of this.formatterExtensions) {
        if (fe.name !== formatterName) {
          continue;
        }

        formatterExtension = fe;
        break;
      }

      if (!formatterExtension) {
        throw new Error(`No formatter with name '${formatterName}' found`);
      }

      return formatterExtension.tryEvaluateFormat(formattingInfo);
    }

    // Go through all (implicit) formatters which contain an empty name
    for (const fe of this.formatterExtensions) {
      if (!fe.canAutoDetect) {
        continue;
      }

      if (fe.tryEvaluateFormat(formattingInfo)) {
        return true;
      }
    }

    return false;
  }

  private checkForExtensions(): void {
    if (this.sourceExtensions.length === 0) {
      throw new Error('No source extensions are available. Please add at least one source extension, such as the DefaultSource.');
    }

    if (this.formatterExtensions.length === 0) {
      throw new Error('No formatter extensions are available. Please add at least one formatter extension, such as the DefaultFormatter.');
    }
  }
}
