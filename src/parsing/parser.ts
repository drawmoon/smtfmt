import { Debug as debug } from '../debug';
import { SmartSettings } from '../settings';
import { Format } from './format';
import { LiteralText } from './literal-text';
import { Placeholder } from './placeholder';
import { Selector } from './selector';

const positionUndefined = -1;

/**
 * Parses a format string.
 */
export class Parser {
  private readonly _operatorChars: string[];
  private readonly _customOperatorChars: string[];
  private readonly _validSelectorChars: string[];

  private _inputFormat: string;
  private _index: IndexContainer;
  private _resultFormat: Format;

  public readonly settings: SmartSettings;

  constructor(smartSettings?: SmartSettings) {
    this.settings = smartSettings ?? new SmartSettings();

    const { parser } = this.settings;

    this._operatorChars = parser.operatorChars();
    this._customOperatorChars = parser.customSelectorChars();
    this._validSelectorChars = [...parser.selectorChars(), ...parser.operatorChars(), ...parser.customSelectorChars()];

    this._inputFormat = '';
    const resultFormat = new Format();
    resultFormat.initialize({ smartSettings: this.settings, baseString: 'init' });
    this._resultFormat = resultFormat;
  }

  /**
   * Parses a format string.
   * @param {String} inputFormat 
   * @returns {Format} The Format for the parsed string.
   */
  public parseFormat(inputFormat: string): Format {
    this._inputFormat = inputFormat;

    this._index = new IndexContainer(
      inputFormat.length,
      positionUndefined,
      0,
      positionUndefined,
      positionUndefined,
      positionUndefined,
      positionUndefined,
      positionUndefined
    );

    // Initialize - will be re-assigned with new placeholders
    this._resultFormat = new Format();
    this._resultFormat.initialize({ smartSettings: this.settings, baseString: this._inputFormat });

    // Store parsing errors until parsing is finished:
    let parsingErrors = {};

    let currentPlaceholder: Placeholder | undefined = undefined;

    // Used for nested placeholders
    let nestedDepth = 0;

    const {
      parser: {
        placeholderBeginChar = '{',
        placeholderEndChar = '}',
      }
    } = this.settings;

    for (this._index.current = 0; this._index.current < this._inputFormat.length; this._index.current++) {
      const inputChar = this._inputFormat[this._index.current];
      if (!currentPlaceholder) {
        if (inputChar === placeholderBeginChar) {
          debug('checking placeholder begin char');

          this.addLiteralCharsParsedBefore();

          if (this.escapeLikeStringFormat(placeholderBeginChar)) {
            continue;
          }

          const result = this.createNewPlaceholder(nestedDepth);
          currentPlaceholder = result[0];
          nestedDepth = result[1];
        } else if (inputChar === placeholderEndChar) {
          debug('checking placeholder end char');

          this.addLiteralCharsParsedBefore();

          if (this.escapeLikeStringFormat(placeholderEndChar)) {
            continue;
          }

          // Make sure that this is a nested placeholder before we un-nest it:


          // End of the placeholder's Format, _resultFormat will change to parent.parent
          nestedDepth = this.finishPlaceholderFormat(nestedDepth);
        }
      } else {
        // Placeholder is NOT null, so that means 
        // we're parsing the selectors:
        debug('placeholder is not null, parsing the selectors');

        const result = this.parseSelector(currentPlaceholder, parsingErrors, nestedDepth);
        currentPlaceholder = result[0];
        parsingErrors = result[1];
        nestedDepth = result[2];
      }
    }

    // We're at the end of the input string

    // 1. Is the last item a placeholder, that is not finished yet?
    if (this._resultFormat.parentPlaceholder || currentPlaceholder) {
      throw new Error('Not implemented');
    } else if (this._index.lastEnd !== this._inputFormat.length) {
      // 2. The last item must be a literal, so add it
      debug('add last text item');

      const literalText = new LiteralText();
      literalText.initialize({
        smartSettings: this.settings,
        parent: this._resultFormat,
        baseString: this._inputFormat,
        startIndex: this._index.lastEnd,
        endIndex: this._inputFormat.length,
      });
      this._resultFormat.items.push(literalText);
    }

    return this._resultFormat;
  }

  /**
   * Adds a new LiteralText item, if there are characters left to process.
   * Sets IndexContainer.lastEnd.
   */
  private addLiteralCharsParsedBefore(): void {
    // Finish the last text item:
    if (this._index.current !== this._index.lastEnd) {
      debug('add text item');

      const literalText = new LiteralText();
      literalText.initialize({
        smartSettings: this.settings,
        parent: this._resultFormat,
        baseString: this._inputFormat,
        startIndex: this._index.lastEnd,
        endIndex: this._index.current,
      });

      debug('text item rawText: %s', literalText.rawText);
      this._resultFormat.items.push(literalText);
    }

    this._index.lastEnd = this._index.safeAdd(this._index.current, 1);
  }

  /**
   * Escape the brace and treat it as a literal character.
   * @param {String} brace The brace { or } to process.
   * @returns {Boolean} true, if escaping was done.
   */
  private escapeLikeStringFormat(brace: string): boolean {
    const { stringFormatCompatibility = false } = this.settings;

    if (stringFormatCompatibility) {
      return false;
    }

    if (this._index.lastEnd < this._inputFormat.length && this._inputFormat[this._index.lastEnd] === brace) {
      this._index.current = this._index.safeAdd(this._index.current, 1);
      return true;
    }

    return false;
  }

  /**
   * Creates a new Placeholder, adds it to the current format and sets values in IndexContainer.
   * @param nestedDepth The counter for nesting levels.
   * @returns {[Placeholder, Number]} The new Placeholder.
   */
  private createNewPlaceholder(nestedDepth: number): [Placeholder, number] {
    nestedDepth++;
    const newPlaceholder = new Placeholder();
    newPlaceholder.initialize({
      smartSettings: this._resultFormat.smartSettings,
      parent: this._resultFormat,
      baseString: this._resultFormat.baseString,
      startIndex: this._index.current,
      nestedDepth: nestedDepth
    });
    this._resultFormat.items.push(newPlaceholder);
    this._resultFormat.hasNested = true;
    this._index.operator = this._index.safeAdd(this._index.current, 1);
    this._index.selector = 0;
    return [newPlaceholder, nestedDepth];
  }

  /**
   * Finishes the current placeholder Format.
   * @param {Number} nestedDepth The counter for nesting levels.
   */
  private finishPlaceholderFormat(nestedDepth: number): number {
    nestedDepth--;
    this._resultFormat.endIndex = this._index.current;
    if (this._resultFormat.parentPlaceholder) {
      this._resultFormat.parentPlaceholder.endIndex = this._index.safeAdd(this._index.current, 1);
      this._resultFormat = this._resultFormat.parentPlaceholder.parent;
    } else {
      debug('_resultFormat.parentPlaceholder is undefined');
    }
    this._index.namedFormatterStart = this._index.namedFormatterOptionsStart = this._index.namedFormatterOptionsEnd = this._index.namedFormatterOptionsEnd = positionUndefined;
    return nestedDepth;
  }

  /**
   * Handles the selectors.
   * @param {Placeholder} currentPlaceholder 
   * @param {ParsingErrors} parsingErrors 
   * @param {Number} nestedDepth 
   */
  private parseSelector(currentPlaceholder: Placeholder | undefined, parsingErrors: any, nestedDepth: number): [Placeholder | undefined, any, number] {
    if (!currentPlaceholder) {
      throw new Error('currentPlaceholder is undefined');
    }

    const {
      parser: {
        formatterNameSeparator = ':',
        placeholderEndChar = '}',
      }
    } = this.settings;

    const inputChar = this._inputFormat[this._index.current];
    if (this._operatorChars.includes(inputChar) || this._customOperatorChars.includes(inputChar)) {
      debug('operator char');

      // Add the selector:
      if (this._index.current !== this._index.lastEnd) { // if equal, we're already parsing a selector
        const selector = new Selector();
        selector.initialize({
          smartSettings: this.settings,
          parent: currentPlaceholder,
          baseString: this._inputFormat,
          startIndex: this._index.lastEnd,
          endIndex: this._index.current,
          operatorStartIndex: this._index.operator,
          selectorIndex: this._index.selector
        });
        currentPlaceholder.addSelector(selector);
        this._index.selector++;
        this._index.operator = this._index.current;
      }
    } else if (inputChar === formatterNameSeparator) {
      debug('formatter name separator');

      throw new Error('Not implemented.');
    } else if (inputChar === placeholderEndChar) {
      debug('placeholder end char');

      const result = this.addLastSelector(currentPlaceholder, parsingErrors);
      currentPlaceholder = result[0];
      parsingErrors = result[1];

      // End the placeholder with no format:
      nestedDepth--;
      currentPlaceholder.endIndex = this._index.safeAdd(this._index.current, 1);
      currentPlaceholder = undefined;
    } else {
      // Ensure the selector characters are valid:
      if (!this._validSelectorChars.includes(inputChar)) {
        throw new Error('Not implemented.');
      }
    }
    
    return [currentPlaceholder, parsingErrors, nestedDepth];
  }

  /**
   * Adds a Selector to the current Placeholder
   * because the current character ':' or '}' indicates the end of a selector.
   * @param currentPlaceholder 
   * @param parsingErrors 
   */
  private addLastSelector(currentPlaceholder: Placeholder, parsingErrors: any): [Placeholder, any] {
    const {
      parser: {
        listIndexEndChar = ']',
        nullableOperator = '?',
      }
    } = this.settings;

    if (this._index.current !== this._index.lastEnd
      || currentPlaceholder.selectors.length === 1 && (this._inputFormat[this._index.operator] === listIndexEndChar || this._inputFormat[this._index.operator] === nullableOperator)
    ) {
      const selector = new Selector();
      selector.initialize({
        smartSettings: this.settings,
        parent: currentPlaceholder,
        baseString: this._inputFormat,
        startIndex: this._index.lastEnd,
        endIndex: this._index.current,
        operatorStartIndex: this._index.operator,
        selectorIndex: this._index.selector
      });
      currentPlaceholder.addSelector(selector);
    } else if (this._index.operator !== this._index.current) { // the selector only contains illegal ("trailing") operator characters
      throw new Error('Not implemented.');
    }

    this._index.lastEnd = this._index.safeAdd(this._index.current, 1);

    return [currentPlaceholder, parsingErrors];
  }
}

/**
 * The Container for indexes pointing to positions within the input format.
 */
class IndexContainer {
  constructor(objectLength: number,
    current: number,
    lastEnd: number,
    namedFormatterStart: number,
    namedFormatterOptionsStart: number,
    namedFormatterOptionsEnd: number,
    operator: number,
    selector: number,
  ) {
    this.objectLength = objectLength;
    this.current = current;
    this.lastEnd = lastEnd;
    this.namedFormatterStart = namedFormatterStart;
    this.namedFormatterOptionsStart = namedFormatterOptionsStart;
    this.namedFormatterOptionsEnd = namedFormatterOptionsEnd;
    this.operator = operator;
    this.selector = selector;
  }

  /**
   * The length of the target object, where indexes will be used.
   */
  public objectLength: number;

  /**
   * The current index within the input format
   */
  public current: number;

  /**
   * The index within the input format after an item (like Placeholder, Selector, LiteralText etc.) was added.
   */
  public lastEnd: number;

  /**
   * The start index of the formatter name within the input format.
   */
  public namedFormatterStart: number;

  /**
   * The start index of the formatter options within the input format.
   */
  public namedFormatterOptionsStart: number;

  /**
   * The end index of the formatter options within the input format.
   */
  public namedFormatterOptionsEnd: number;

  /**
   * The index of the operator within the input format.
   */
  public operator: number;

  /**
   * The current index of the selector across all Placeholders.
   */
  public selector: number;

  /**
   * Adds a number to number to the index and returns the sum, but not more than ObjectLength.
   * @param {Number} index 
   * @param {Number} add 
   * @returns {Number} The sum, but not more than ObjectLength
   */
  public safeAdd(index: number, add: number): number {
    // The design is the way, that an end index
    // is always 1 above the last position.
    // Meaning that the maximum of 'FormatItem.EndIndex' equals 'inputFormat.Length'
    index += add;
    // debug(index >= 0);
    return index < this.objectLength ? index : this.objectLength;
  }
}
