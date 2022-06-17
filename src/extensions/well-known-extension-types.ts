import { IFormatter, ISource } from '../interfaces';
import { isSourceExtension } from '../util';

const sources: Record<string, number> = {
  ['GlobalVariablesSource']: 1000,
  ['PersistentVariablesSource']: 2000,
  ['StringSource']: 3000,
  ['ListFormatter']: 4000,
  ['DictionarySource']: 5000,
  ['ValueTupleSource']: 6000,
  ['SystemTextJsonSource']: 7000,
  ['NewtonsoftJsonSource']: 8000,
  ['XmlSource']: 9000,
  // sources for specific types must be in the list before ReflectionSource
  ['ReflectionSource']: 10000,
  ['KeyValuePairSource']: 11000,
  ['DefaultSource']: 12000,
};

const formatters: Record<string, number> = {
  ['ListFormatter']:  1000,
  ['PluralLocalizationFormatter']:  2000,
  ['ConditionalFormatter']:  3000,
  ['TimeFormatter']:  4000,
  ['XElementFormatter']:  5000,
  ['IsMatchFormatter']:  6000,
  ['NullFormatter']:  7000,
  ['LocalizationFormatter']:  8000,
  ['TemplateFormatter']:  9000,
  ['ChooseFormatter']:  10000,
  ['SubStringFormatter']:  11000,
  ['DefaultFormatter']: 12000,
};

export function getIndexToInsert<T extends ISource | IFormatter>(currentExtensions: T[], extensionToIndex: T): number {
  // It's the first extensions
  if (currentExtensions.length === 0) {
    return 0;
  }

  const wellKnownList = isSourceExtension(extensionToIndex) ? sources : formatters;

  // Unknown extensions will add to the end
  const indexOfNewExt = Object.keys(wellKnownList).indexOf(extensionToIndex.constructor.name);
  if (indexOfNewExt === -1) {
    return currentExtensions.length;
  }

  for (let i = currentExtensions.length - 1; i >= 0; i--) {
    const index = Object.keys(wellKnownList).indexOf(currentExtensions[i].constructor.name);
    if (index === -1) {
      continue;
    }

    if (index > indexOfNewExt) {
      continue;
    }

    return i + 1;
  }

  // Add as first
  return 0;
}
