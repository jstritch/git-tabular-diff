'use babel';

import * as helper from './helpers';
import { promises as fs } from 'fs';
import GitTabularDiff from '../lib/git-tabular-diff';
import GitTabularDiffView from '../lib/git-tabular-diff-view';
import path from 'path';

const methodName = 'GitTabularDiff.compareSelectedFiles()';
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
const exampleSavedDiffFile = path.join('spec', 'data', 'example-saved.csv.gtd');

function openView(split) {
  if (!split) {
    return GitTabularDiff.compareSelectedFiles();
  }
  return GitTabularDiff.compareSelectedSplit();
}

describe(methodName, function() {

  beforeEach(async function() {
    await fs.writeFile(verificationPath, nonexistentText);
    await fs.copyFile(exampleModifiedPath, examplePath);
  });

  afterEach(async function() {
    await fs.writeFile(verificationPath, verificationText);
    await fs.copyFile(exampleCopyPath, examplePath);
  });

  [false, true].forEach((split) => {
    [exampleFile, verificationFile, exampleSavedDiffFile].forEach((file) => {
      it(`opens a view for modified file ${file}`, async function() {
        GitTabularDiff.activate(null);
        GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
        const id = await openView(split);

        expect(id.length).toBe(36);
        const workspaceElement = atom.views.getView(atom.workspace);
        expect(workspaceElement).toExist();
        const gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
        expect(gitTabularDiffElement).toExist();
        expect(gitTabularDiffElement).toHaveClass('git-tabular-diff');

        expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);
      });
    });
  });

  [false, true].forEach((split) => {
    [nonexistentFile, exampleCopyFile].forEach((file) => {
      it(`does not open a view for ${file}`, async function() {
        GitTabularDiff.activate(null);
        GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
        const id = await openView(split);

        expect(id).toBeNull();
        const workspaceElement = atom.views.getView(atom.workspace);
        expect(workspaceElement).toExist();
        expect(workspaceElement.querySelector('.git-tabular-diff')).not.toExist();

        expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);
      });
    });
  });
});
