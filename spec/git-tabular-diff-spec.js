'use babel';

import * as helper from './helpers';
import { promises as fs } from 'fs';
import GitTabularDiff from '../lib/git-tabular-diff';
import GitTabularDiffView from '../lib/git-tabular-diff-view';
import path from 'path';

const methodName = 'GitTabularDiff.compareSelected()';
const repositoryPath = process.cwd();
const verificationFile = path.join('spec', 'data', 'git-test-file.txt');
const verificationPath = path.join(repositoryPath, verificationFile);
const verificationText = 'git-tabular-diff verification file spec/data/git-test-file.txt\n';
const nonexistentFile = path.join('spec', 'data', 'lorem ipsum.txt');
const nonexistentText = 'Lorem ipsum dolor sit amet, consectetur adipiscing git tabular diff\n';
const exampleFile = path.join('spec', 'data', 'example.csv');
const examplePath = path.join(repositoryPath, exampleFile);
const exampleCopyFile = path.join('spec', 'data', 'example-copy.csv');
const exampleCopyPath = path.join(repositoryPath, exampleCopyFile);
const exampleModifiedFile = path.join('spec', 'data', 'example-modified.csv');
const exampleModifiedPath = path.join(repositoryPath, exampleModifiedFile);
const exampleSavedDiffFileV1 = path.join('spec', 'data', 'example-saved-v1.csv.gtd');
const exampleSavedDiffFileV2 = path.join('spec', 'data', 'example-saved-v2.csv.gtd');
const exampleSavedIgnoreCaseFileV1 = path.join('spec', 'data', 'example-saved-ignorecase-v1.csv.gtd');
const exampleSavedIgnoreCaseFileV2 = path.join('spec', 'data', 'example-saved-ignorecase-v2.csv.gtd');
const exampleSavedIgnoreWhitespaceFileV1 = path.join('spec', 'data', 'example-saved-ignorewhitespace-v1.csv.gtd');
const exampleSavedIgnoreWhitespaceFileV2 = path.join('spec', 'data', 'example-saved-ignorewhitespace-v2.csv.gtd');
const exampleSavedSplitFileV2 = path.join('spec', 'data', 'example-saved-ignorewhitespace-v2.csv.gtd');
const exampleSplitFile = path.join('spec', 'data', 'example-split.jpg.gtd');

describe(methodName, function() {

  beforeEach(async function() {
    await fs.writeFile(verificationPath, nonexistentText);
    await fs.copyFile(exampleModifiedPath, examplePath);
  });

  afterEach(async function() {
    await fs.writeFile(verificationPath, verificationText);
    await fs.copyFile(exampleCopyPath, examplePath);
  });

  [
    [exampleFile, false], [exampleFile, true],
    [verificationFile, false], [verificationFile, true],
    [exampleSavedDiffFileV1, false], [exampleSavedDiffFileV1, true],
    [exampleSavedDiffFileV2, false], [exampleSavedDiffFileV2, true],
    [exampleSavedIgnoreCaseFileV1, false], [exampleSavedIgnoreCaseFileV1, true],
    [exampleSavedIgnoreCaseFileV2, false], [exampleSavedIgnoreCaseFileV2, true],
    [exampleSavedIgnoreWhitespaceFileV1, false], [exampleSavedIgnoreWhitespaceFileV1, true],
    [exampleSavedIgnoreWhitespaceFileV2, false], [exampleSavedIgnoreWhitespaceFileV2, true],
    [exampleSavedSplitFileV2, false], [exampleSavedSplitFileV2, true],
    [exampleSplitFile, true],
  ].forEach(([file, split]) => {
    it(`opens a ${helper.getViewType(split)} view for modified file ${file}`, async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
      const id = await helper.openView(split);
      expect(id.length).toBe(36);
      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      const view = atom.workspace.getActivePaneItem();
      expect(view).toBeInstanceOf(GitTabularDiffView);
    });
  });

  [
    [nonexistentFile, false], [nonexistentFile, true],
    [exampleCopyFile, false], [exampleCopyFile, true],
  ].forEach(([file, split]) => {
    it(`does not open a ${helper.getViewType(split)} view for ${file}`, async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
      const id = await helper.openView(split);

      expect(id).toBeNull();
      const workspaceElement = atom.views.getView(atom.workspace);
      expect(workspaceElement).toExist();
      expect(workspaceElement.querySelector('.git-tabular-diff')).not.toExist();

      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);
    });
  });
});
