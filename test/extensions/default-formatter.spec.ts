import { format } from '../../src';
import { FormatDelegate } from '../../src/format-delegate';

function htmlActionLink(linkText: string, actionName: string): string {
  return format("<a href='www.example.com/{1}'>{0}</a>", linkText, actionName);
}

test('formatdelegate works with format', () => {
  const testCase = [
    ['Please visit {0:this page} for more info.', "Please visit <a href='www.example.com/SomePage'>this page</a> for more info."],
    ['And {0:this other page} is cool too.', "And <a href='www.example.com/SomePage'>this other page</a> is cool too."],
    ['There are {0:two} {0:links} in this one.', "There are <a href='www.example.com/SomePage'>two</a> <a href='www.example.com/SomePage'>links</a> in this one."]
  ];

  const formatDelegate = new FormatDelegate((text) => htmlActionLink(text ?? 'null', 'SomePage'));
  
  for (const [k, v] of testCase) {
    expect(format(k, formatDelegate)).toBe(v);
  }
});
