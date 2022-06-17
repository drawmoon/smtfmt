import { FormatDetails } from './format-details';
import { FormattingInfo } from './formatting-info';
import { Format, FormatItem, Placeholder } from './parsing';
import { SmartSettings } from './settings';

type Primitive = string | number | boolean | symbol;
export type Argument = Primitive | Date | { [key: string]: Primitive | Date };

export interface FormatItemInitializeOptions {
  smartSettings: SmartSettings;

  /**
   * The parent FormatItem or undefined.
   */
  parent?: FormatItem;

  /**
   * The base format string.
   */
  baseString: string;

  /**
   * The start index of the FormatItem within the base format string.
   */
  startIndex?: number;

  /**
   * The end index of the FormatItem within the base format string.
   */
  endIndex?: number;
}

export interface FormatInitializeOptions extends FormatItemInitializeOptions {
  /**
   * The parent Placeholder.
   */
  parent?: Placeholder;

  /**
   * true if the nested formats exist.
   */
  hasNested?: boolean;
}

export interface PlaceholderInitializeOptions extends FormatItemInitializeOptions {
  /**
   * The parent Format of the placeholder
   */
  parent: Format;

  /**
   * The nesting level of this placeholder.
   */
  nestedDepth: number;
}

export interface SelectorInitializeOptions extends FormatItemInitializeOptions {
  operatorStartIndex: number;

  selectorIndex: number;
}

export interface FormattingInfoInitializeOptions {
  parent?: FormattingInfo;

  formatDetails: FormatDetails;

  format?: Format;

  placeholder?: Placeholder;

  currentValue?: any;
}
