import { FormatItem } from './parsing';

/**
 * An exception caused while attempting to output the format.
 */
export class FormattingException extends Error {
  /**
   * 
   * @param issue The description of the error.
   * @param index The index inside the format string, where the error occurred.
   * @param errorItem The FormatItem which caused the Error.
   */
  constructor(issue: string | unknown, index: number, errorItem?: FormatItem) {
    const message = typeof issue === 'string'
      ? issue
      : issue instanceof Error ? issue.message : 'Unknown error';
    const format = errorItem?.baseString;
    super(`Error parsing format string: ${message} at ${index}\n${format}\n${String.prototype.padStart(index, '-') + "^"}`);

    this.issue = message;
    this.index = index;
    this.errorItem = errorItem;
    this.format = format;
  }

  /**
   * Get the base format string of the FormatItem causing the Error.
   */
  public readonly format: string | undefined;

  /**
   * Get the FormatItem which caused the Error.
   */
  public readonly errorItem: FormatItem | undefined;

  /**
   * Gets the description of the error.
   */
  public readonly issue: string;

  /**
   * The index inside the format string, where the error occurred.
   */
  public readonly index: number;
}
