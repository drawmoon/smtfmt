import { Debug as debug } from '../debug';
import { IFormattingInfo, IOutput } from '../interfaces';

/**
 * Wraps a Array so it can be used for output.
 */
export class StringOutput implements IOutput {
  private readonly output: Array<string>;

  /**
   * Creates a new instance of StringOutput.
   */
  constructor();

  /**
   * Creates a new instance of StringOutput with the given capacity.
   * @param {Number} capacity The estimated capacity for the result string. Essential for performance and GC pressure.
   */
  constructor(capacity: number);

  constructor(capacity?: number | undefined) {
    if (capacity) {
      this.output = new Array<string>(capacity);
    } else {
      this.output = new Array<string>();
    }
  }

  public write(text: string, formattingInfo?: IFormattingInfo): void {
    debug('write string: %s, formatting info: %O', text, formattingInfo);

    this.output.push(text);
  }

  public toString(): string {
    return this.output.join('');
  }
}
