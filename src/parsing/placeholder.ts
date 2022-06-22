import { PlaceholderInitializeOptions } from '../types';
import { isDigit } from '../util';
import { Format } from './format';
import { FormatItem } from './format-item';
import { Selector } from './selector';

export class Placeholder extends FormatItem {
  private _formatterNameCache?: string;

  /**
   * Initializes the instance of Placeholder.
   * @param options 
   */
  public initialize(options: PlaceholderInitializeOptions): void {
    const {
      parent,
      smartSettings = parent.smartSettings,
      baseString = parent.baseString,
      startIndex = 0,
      endIndex = parent.endIndex,
      nestedDepth
    } = options;

    super.initialize({ smartSettings, parent, baseString, startIndex, endIndex });

    this.nestedDepth = nestedDepth;
    this.formatterNameStartIndex = startIndex;
    this.formatterNameLength = 0;
    this.formatterOptionsStartIndex = startIndex;
    this.formatterOptionsLength = 0;
  }

  /**
   * Gets the parent Parsing.Format.
   */
  public get parent(): Format {
    return this.parentFormatItem as Format;
  }

  public nestedDepth: number;

  public selectors: Selector[] = [];

  /**
   * Add a new Selector to the list Selector.
   * If the Selector has an alignment operator, the this.alignment will be set.
   * @param selector The Selector to add.
   */
  public addSelector(selector: Selector): void {
    const {
      parser: { alignmentOperator }
    } = this.smartSettings;

    if (selector.operatorLength > 0
      && selector.operator[0] === alignmentOperator
      && isDigit(selector.rawText)) {
        this.alignment = parseInt(selector.rawText);
      }

    this.selectors.push(selector);
  }

  public formatterNameStartIndex: number;

  public formatterNameLength: number;

  public formatterOptionsStartIndex: number;

  public formatterOptionsLength: number;

  /**
   * Gets the name of the formatter.
   */
  public get formatterName(): string {
    return this._formatterNameCache ??= this.baseString.slice(this.formatterNameStartIndex, this.formatterNameLength);
  }

  public format?: Format;

  public alignment: number;
}
