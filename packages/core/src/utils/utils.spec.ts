import { isDryRun } from './args';

describe('Utils', () => {
  it('Should detect dry run flag', () => {
    const before = isDryRun();
    process.argv.push('--dry-run');
    const after = isDryRun();
    expect({before, after}).toStrictEqual({before: false, after: true})
  });
});
