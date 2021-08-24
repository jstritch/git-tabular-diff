'use babel';

import * as git from '../../lib/git';
import { promises as fs } from 'fs';
import path from 'path';

const methodName = 'git.readHeadAndWork()';
const gitCommand = 'git show HEAD:';
const repositoryPath = process.cwd();
const verificationFile = 'spec/data/git-test-file.txt';
const verificationPath = path.format({ dir: repositoryPath, base: verificationFile });
const verificationText = 'git-tabular-diff verification file spec/data/git-test-file.txt\n';
const nonexistentFile = 'spec/data/lorem ipsum.txt';
const nonexistentPath = path.format({ dir: repositoryPath, base: nonexistentFile });
const nonexistentText = 'Lorem ipsum dolor sit amet, consectetur adipiscing git tabular diff\n';

describe(methodName, () => {

  afterEach(async function () {
    await fs.writeFile(verificationPath, verificationText);
    try { await fs.unlink(nonexistentPath); } catch (e) { return; }
  });

  it ('should read identical head and work for an unmodified file', async function () {
    let gitFiles, errorMessage;
    try {
      gitFiles = await git.readHeadAndWork(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(gitFiles.head).toBe(verificationText);
    expect(gitFiles.work).toBe(verificationText);
    expect(errorMessage).not.toBeDefined();
  });

  it ('should read correct head and work for a modified file', async function () {
    await fs.writeFile(verificationPath, nonexistentText);

    let gitFiles, errorMessage;
    try {
      gitFiles = await git.readHeadAndWork(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(gitFiles.head).toBe(verificationText);
    expect(gitFiles.work).toBe(nonexistentText);
    expect(errorMessage).not.toBeDefined();
  });

  it ('should detect no head version for a new file (nothing to compare against)', async function () {
    await fs.writeFile(nonexistentPath, nonexistentText);

    let gitFiles, errorMessage;
    try {
      gitFiles = await git.readHeadAndWork(repositoryPath, nonexistentFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(gitFiles).not.toBeDefined();
    expect(errorMessage).toContain(gitCommand);
    expect(errorMessage).toContain(repositoryPath);
    expect(errorMessage).toContain(nonexistentFile);
    expect(errorMessage).toContain('not in \'HEAD\'');
  });

  it ('should detect no work version for a deleted file (nothing to compare against)', async function () {
    try { await fs.unlink(verificationPath); } catch (e) { return; }

    let gitFiles, errorMessage;
    try {
      gitFiles = await git.readHeadAndWork(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(gitFiles).not.toBeDefined();
    expect(errorMessage).toContain(repositoryPath);
    expect(errorMessage).toContain(verificationFile);
    expect(errorMessage).toContain('no such file');
  });

  it ('should detect any error reported by readHead() or readWork()', async function () {
    let fileContents, errorMessage;
    try {
      fileContents = await git.readHeadAndWork(null, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(fileContents).not.toBeDefined();
    expect(errorMessage).toContain('repositoryPath');
    expect(errorMessage).toContain('null');
  });
});
