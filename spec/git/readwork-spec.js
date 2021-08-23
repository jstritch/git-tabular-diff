'use babel';

import * as git from '../../lib/git';

const methodName = 'git.readWork()';
const repositoryPath = process.cwd();
const verificationFile = 'spec/data/git-test-file.txt';
const verificationText = 'git-tabular-diff verification file spec/data/git-test-file.txt\n';
const nonexistentFile = 'spec/data/lorem ipsum.txt';

describe(methodName, () => {

  it ('should read an existing file', async function () {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readWork(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).toBe(verificationText);
    expect(errorMessage).not.toBeDefined();
  });

  it ('should detect a null repositoryPath', async function () {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readWork(null, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('repositoryPath');
    expect(errorMessage).toContain('null');
  });

  it ('should detect a null relativePath', async function () {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readWork(repositoryPath, null);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('relativePath');
    expect(errorMessage).toContain('null');
  });

  it ('should detect a read error', async function () {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readWork(repositoryPath, nonexistentFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(repositoryPath);
    expect(errorMessage).toContain(nonexistentFile);
    expect(errorMessage).toContain('no such file');
  });
});
