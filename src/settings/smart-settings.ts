export class SmartSettings {
  /**
   * Compatible escaping of curly braces, {{ and }},
   * Thread safety is relevant for global caching, lists and object pools,
   * which can be filled from different threads concurrently.
   * @description true does **not** guarantee thread safety of all classes.
   * Default is true.
   */
  public stringFormatCompatibility = false;

  /**
   * Gets the settings for the parser.
   * Set only during initialization.
   */
  public parser = new ParserSettings();

  /**
   * Gets the settings for the formatter.
   * Set only during initialization.
   */
  public formatter = new FormatterSettings();
}

export class ParserSettings {
  private readonly _alphanumericSelectorChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'.split('');

  private readonly _customSelectorChars: string[] = [];

  /**
   * The list of standard selector characters.
   * @returns {String[]}
   */
  public selectorChars(): string[] {
    return this._alphanumericSelectorChars;
  }

  /**
   * Gets a read-only list of the custom selector characters, which were set with addCustomSelectorChars.
   * @returns {String[]}
   */
  public customSelectorChars(): string[] {
    return this._customSelectorChars;
  }

  /**
   * This setting is relevant for the LiteralText.
   * If true (the default), character string literals are treated, format("\t") will return a "TAB" character
   * If false, character string literals are not converted, will return the 2 characters "\" and "t"
   */
  public convertCharacterStringLiterals = true;

  /**
   * The character literal escape character for PlaceholderBeginChar and PlaceholderEndChar,
   * but also others like for \t (TAB), \n (NEW LINE), \\ (BACKSLASH) and others defined in EscapedLiteral.
   */
  public charLiteralEscapeChar = '\\';

  /**
   * Gets the character indicating the start of a Placeholder.
   */
  public placeholderBeginChar = '{';

  /**
   * Gets the character indicating the end of a Placeholder.
   */
  public placeholderEndChar = '}';

  /**
   * The character which separates the formatter name (if any exists) from other parts of the placeholder.
   * E.g.: {Variable:FormatterName:argument} or {Variable:FormatterName}
   */
  public formatterNameSeparator = ':';

  /**
   * The standard operator characters.
   * Contiguous operator characters are parsed as one operator (e.g. '?.').
   * @returns {String[]}
   */
  public operatorChars(): string[] {
    return [this.selectorOperator, this.nullableOperator, this.alignmentOperator, this.listIndexBeginChar, this.listIndexEndChar];
  }

  /**
   * The character which separates the selector for alignment. `E.g.: format("Name: {name,10}")`
   */
  public alignmentOperator = ',';

  /**
   * The character which separates two or more selectors `E.g.: "First.Second.Third"`
   */
  public selectorOperator = '.';

  /**
   * The character which flags the selector as nullable.
   * The character after NullableOperator must be the SelectorOperator.
   * `E.g.: "First?.Second"`
   */
  public nullableOperator = '?';

  /**
   * Gets the character indicating the begin of a list index, like in "{Numbers[0]}"
   */
  public listIndexBeginChar = '[';

  /**
   * Gets the character indicating the end of a list index, like in "{Numbers[0]}"
   */
  public listIndexEndChar = ']';
}

export class FormatterSettings {
  /**
   * Gets or sets the FormatterSettings.ErrorAction to use for the SmartFormatter.
   * - throwError: Throws an exception. This is only recommended for debugging, so that formatting errors can be easily found.
   * - outputErrorInResult: Includes an issue message in the output
   * - ignore: Ignores errors and tries to output the data anyway
   * - maintainTokens: Leaves invalid tokens unmodified in the text.
   * @default throwError
   */
  public errorAction: 'throwError' | 'outputErrorInResult' | 'ignore' | 'maintainTokens' = 'throwError';

  /**
   * Gets or sets the character which is used for pre-aligning or post-aligning items (e.g.: {Placeholder,10} for an alignment width of 10).
   * Default is the space character (0x20).
   */
  public alignmentFillCharacter = ' ';
}
