'use babel';

import * as helper from './helpers';
import { promises as fs } from 'fs';
import GitTabularDiff from '../lib/git-tabular-diff';
import GitTabularDiffView from '../lib/git-tabular-diff-view';
import path from 'path';

const methodName = 'GitTabularDiff.compareSelectedFiles()';
const repositoryPath = process.cwd();
const verificationFile = 'spec/data/git-test-file.txt';
const verificationPath = path.join(repositoryPath, verificationFile);
const verificationText = 'git-tabular-diff verification file spec/data/git-test-file.txt\n';
const nonexistentFile = 'spec/data/lorem ipsum.txt';
const nonexistentText = 'Lorem ipsum dolor sit amet, consectetur adipiscing git tabular diff\n';
const exampleFile = 'spec/data/example.csv';
const examplePath = path.join(repositoryPath, exampleFile);
const exampleCopyFile = 'spec/data/example-copy.csv';
const exampleCopyPath = path.join(repositoryPath, exampleCopyFile);
const exampleModifiedFile = 'spec/data/example-modified.csv';
const exampleModifiedPath = path.join(repositoryPath, exampleModifiedFile);

describe(methodName, function() {

  beforeEach(async function() {
    await fs.writeFile(verificationPath, nonexistentText);
    await fs.copyFile(exampleModifiedPath, examplePath);
  });

  afterEach(async function() {
    await fs.writeFile(verificationPath, verificationText);
    await fs.copyFile(exampleCopyPath, examplePath);
  });

  [exampleFile, verificationFile].forEach((file) => {
    it(`opens a view for modified file ${file}`, async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
      const id = await GitTabularDiff.compareSelectedFiles();

      expect(id.length).toBe(36);
      const workspaceElement = atom.views.getView(atom.workspace);
      expect(workspaceElement).toExist();
      const gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
      expect(gitTabularDiffElement).toExist();
      expect(gitTabularDiffElement).toHaveClass('git-tabular-diff');

      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);
    });
  });

  [nonexistentFile, exampleCopyFile].forEach((file) => {
    it(`does not open a view for ${file}`, async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
      const id = await GitTabularDiff.compareSelectedFiles();

      expect(id).toBeNull();
      const workspaceElement = atom.views.getView(atom.workspace);
      expect(workspaceElement).toExist();
      expect(workspaceElement.querySelector('.git-tabular-diff')).not.toExist();

      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);
    });
  });
});
