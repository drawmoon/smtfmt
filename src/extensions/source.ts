import { Debug as debug } from '../debug';
import { IInitializer, ISelectorInfo, ISource } from '../interfaces';
import { SmartFormatter } from '../smart-formatter';

export abstract class Source implements ISource, IInitializer {
  protected formatter?: SmartFormatter;

  protected smartSettings?: any;

  public tryEvaluateSelector(selectorInfo: ISelectorInfo): boolean {
    debug('no override tryEvaluateSelector, selector: %O', selectorInfo);
    return false;
  }

  public initialize(smartFormatter: SmartFormatter): void {
    this.formatter = smartFormatter;
    this.smartSettings = smartFormatter.settings;
  }
}
