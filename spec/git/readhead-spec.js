'use babel';

import * as git from '../../lib/git';

const methodName = 'git.readHead()';
const gitCommand = 'git show HEAD:';
const repositoryPath = process.cwd();
const nonexistentPath = '0a006ece-0363-11ec-b758-435342a04317';
const verificationFile = 'spec/data/git-test-file.txt';
const verificationText = 'git-tabular-diff verification file spec/data/git-test-file.txt\n';
const nonexistentFile = 'spec/data/lorem ipsum.txt';

describe(methodName, () => {

  it('should read an existing file', async function() {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readHead(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).toBe(verificationText);
    expect(errorMessage).not.toBeDefined();
  });

  it('should detect a null repositoryPath', async function() {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readHead(null, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('repositoryPath');
    expect(errorMessage).toContain('null');
  });

  it('should not try to create the git process with a nonexistent cwd', async function() {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readHead(nonexistentPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('repositoryPath');
    expect(errorMessage).toContain(nonexistentPath);
    expect(errorMessage).toContain('exist');
  });

  it('should detect a null relativePath', async function() {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readHead(repositoryPath, null);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('relativePath');
    expect(errorMessage).toContain('null');
  });

  it('should detect a git error', async function() {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readHead(repositoryPath, nonexistentFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain(gitCommand);
    expect(errorMessage).toContain(repositoryPath);
    expect(errorMessage).toContain(nonexistentFile);
  });
});
