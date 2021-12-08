'use babel';

import * as git from '../../lib/git';
import { promises as fs } from 'fs';
import path from 'path';

const methodName = 'git.diff()';
const repositoryPath = process.cwd();
const verificationFile = path.join('spec', 'data', 'git-test-file.txt');
const verificationPath = path.join(repositoryPath, verificationFile);
const verificationText = 'git-tabular-diff verification file spec/data/git-test-file.txt\n';
const nonexistentFile = path.join('spec', 'data', 'lorem ipsum.txt');
const nonexistentPath = path.join(repositoryPath, nonexistentFile);
const nonexistentText = 'Lorem ipsum dolor sit amet, consectetur adipiscing git tabular diff\n';
const goodUnifiedDiffTail = `--- a/spec/data/git-test-file.txt
+++ b/spec/data/git-test-file.txt
@@ -1 +1 @@
-git-tabular-diff verification file spec/data/git-test-file.txt
+Lorem ipsum dolor sit amet, consectetur adipiscing git tabular diff\n`;

describe(methodName, () => {

  afterEach(async function() {
    await fs.writeFile(verificationPath, verificationText);
    try { await fs.unlink(nonexistentPath); } catch (e) { return; }
  });

  it('should return the empty string for an unmodified file', async function() {
    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).toBe('');
    expect(errorMessage).not.toBeDefined();
  });

  it('should generate the correct difference for a modified file', async function() {
    await fs.writeFile(verificationPath, nonexistentText);

    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).toContain(goodUnifiedDiffTail);
    expect(errorMessage).not.toBeDefined();
  });

  it('should return the empty string for a new file (nothing to compare against)', async function() {
    await fs.writeFile(nonexistentPath, nonexistentText);

    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(repositoryPath, nonexistentFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).toBe('');
    expect(errorMessage).not.toBeDefined();
  });

  it('should return the empty string for a deleted file (nothing to compare against)', async function() {
    try { await fs.unlink(verificationPath); } catch (e) { return; }

    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(repositoryPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).toBe('');
    expect(errorMessage).not.toBeDefined();
  });

  it('should detect a null repositoryPath', async function() {
    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(null, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('repositoryPath');
    expect(errorMessage).toContain('null');
  });

  it('should not try to create the git process with a nonexistent cwd', async function() {
    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(nonexistentPath, verificationFile);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('repositoryPath');
    expect(errorMessage).toContain(nonexistentPath);
    expect(errorMessage).toContain('exist');
  });

  it('should detect a null relativePath', async function() {
    let unifiedDiff, errorMessage;
    try {
      unifiedDiff = await git.diff(repositoryPath, null);
    } catch (e) {
      errorMessage = e;
    }

    expect(unifiedDiff).not.toBeDefined();
    expect(errorMessage).toContain(methodName);
    expect(errorMessage).toContain('relativePath');
    expect(errorMessage).toContain('null');
  });
});
