import { SelectorInitializeOptions } from '../types';
import { FormatItem } from './format-item';

export class Selector extends FormatItem {
  private _operatorCache?: string;

  private _operatorStartIndex: number;
  private _selectorIndex: number;

  /**
   * Gets the length of the operator.
   */
  public get operatorLength(): number {
    return this.startIndex - this.operatorStartIndex;
  }

  public get operatorStartIndex(): number {
    return this._operatorStartIndex;
  }

  public get selectorIndex(): number {
    return this._selectorIndex;
  }

  /**
   * Gets the operator characters.
   * @example The operator that came between selectors is typically ("." or "?.")
   */
  public get operator(): string {
    return this._operatorCache ??= this.baseString.slice(this.operatorStartIndex, this.operatorLength);
  }

  /**
   * Initializes the instance of Selector.
   * @param options 
   */
  public initialize(options: SelectorInitializeOptions): void {
    const { smartSettings, parent, baseString, startIndex, endIndex, selectorIndex, operatorStartIndex } = options;

    super.initialize({ smartSettings, parent, baseString, startIndex, endIndex });

    this._operatorStartIndex = operatorStartIndex;
    this._selectorIndex = selectorIndex;
  }

  public clear(): void {
    super.clear();
    this._selectorIndex = 0;
    this._operatorStartIndex = 0;
    this._operatorCache = undefined;
  }
}
