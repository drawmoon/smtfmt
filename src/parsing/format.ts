import { FormatInitializeOptions } from '../types';
import { FormatItem } from './format-item';
import { Placeholder } from './placeholder';

export class Format extends FormatItem {
  public parentPlaceholder?: Placeholder;

  /**
   * Returns true, if the Format is nested.
   */
  public hasNested: boolean;

  public initialize(options: FormatInitializeOptions): void {
    const { smartSettings, parent, startIndex = 0, hasNested } = options;
    let { baseString,  endIndex = baseString.length } = options;

    if (parent) {
      baseString = parent.baseString;
      endIndex = parent.endIndex;
      this.parentPlaceholder = parent;
    }

    super.initialize({ smartSettings, parent, baseString, startIndex, endIndex });

    if (hasNested !== undefined) {
      this.hasNested = hasNested;
    }
  }

  /**
   * Gets the Array<T> of FormatItems.
   */
  public readonly items: FormatItem[] = [];
}
