'use babel';

import * as helper from './helpers';
import { promises as fs } from 'fs';
import GitTabularDiff from '../lib/git-tabular-diff';
import GitTabularDiffView from '../lib/git-tabular-diff-view';
import path from 'path';

const repositoryPath = process.cwd();
const exampleFile = path.join('spec', 'data', 'example.csv');
const examplePath = path.join(repositoryPath, exampleFile);
const exampleCopyFile = path.join('spec', 'data', 'example-copy.csv');
const exampleCopyPath = path.join(repositoryPath, exampleCopyFile);
const exampleModifiedFile = path.join('spec', 'data', 'example-modified.csv');
const exampleModifiedPath = path.join(repositoryPath, exampleModifiedFile);

const saveAsFile = `${exampleFile}${GitTabularDiffView.getFileExtension()}`;
const saveAsPath = `${examplePath}${GitTabularDiffView.getFileExtension()}`;
const goodSaveAsFile = path.join('spec', 'data', 'example-saved-v2.csv.gtd');
const goodSaveAsIgnoreCaseFile = path.join('spec', 'data', 'example-saved-ignorecase-v2.csv.gtd');
const goodSaveAsIgnoreWhitespaceFile = path.join('spec', 'data', 'example-saved-ignorewhitespace-v2.csv.gtd');
const goodSaveAsSplitFile = path.join('spec', 'data', 'example-saved-split-v2.csv.gtd');

describe('GitTabularDiffView.serialize()', function() {
  let ignoreCase, ignoreWhitespace;

  beforeEach(async function() {
    ignoreCase = atom.config.get('git-tabular-diff.ignoreCase');
    ignoreWhitespace = atom.config.get('git-tabular-diff.ignoreWhitespace');
    atom.config.set('git-tabular-diff.ignoreCase', false);
    atom.config.set('git-tabular-diff.ignoreWhitespace', false);
    await fs.copyFile(exampleModifiedPath, examplePath);
  });

  afterEach(async function() {
    atom.config.set('git-tabular-diff.ignoreCase', ignoreCase);
    atom.config.set('git-tabular-diff.ignoreWhitespace', ignoreWhitespace);
    await fs.copyFile(exampleCopyPath, examplePath);
  });

  [false, true].forEach((split) => {
    it(`serializes and deserializes the ${helper.getViewType(split)} view`, async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, exampleFile);
      const id = await helper.openView(split);
      expect(id.length).toBe(36);
      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      let view = atom.workspace.getActivePaneItem();
      expect(view).toBeInstanceOf(GitTabularDiffView);

      const serializedState = view.serialize();

      view.destroy();
      view = null;

      view = GitTabularDiff.deserializeGitTabularDiffView(serializedState);
      expect(view).toBeInstanceOf(GitTabularDiffView);
      expect(view.title).toBe(exampleFile);
      expect(view.getURI()).toBe(GitTabularDiffView.makeUri(id));
    });
  });
});

describe('GitTabularDiffView.saveAs()', function() {
  let ignoreCase, ignoreWhitespace;

  beforeEach(async function() {
    ignoreCase = atom.config.get('git-tabular-diff.ignoreCase');
    ignoreWhitespace = atom.config.get('git-tabular-diff.ignoreWhitespace');
    atom.config.set('git-tabular-diff.ignoreCase', false);
    atom.config.set('git-tabular-diff.ignoreWhitespace', false);
  });

  afterEach(async function() {
    atom.config.set('git-tabular-diff.ignoreCase', ignoreCase);
    atom.config.set('git-tabular-diff.ignoreWhitespace', ignoreWhitespace);
    try { await fs.unlink(saveAsPath); } catch (e) { return; }
  });

  [
    [goodSaveAsFile, false],
    [goodSaveAsIgnoreCaseFile, false],
    [goodSaveAsIgnoreWhitespaceFile, false],
    [goodSaveAsSplitFile, true],
  ].forEach(([file, split]) => {
    it(`saves the ${helper.getViewType(split)} view with settings so it may be shared for file ${file}`, async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
      const id = await helper.openView(split);
      expect(id.length).toBe(36);
      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      const view = atom.workspace.getActivePaneItem();
      expect(view).toBeInstanceOf(GitTabularDiffView);

      // opening again should activate the existing view, not open another
      const id2 = await helper.openView(split);
      expect(id2).toBe(id);
      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      const view2 = atom.workspace.getActivePaneItem();
      expect(view2).toBe(view);
      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      expect(view2.getPath()).toBe(saveAsFile);
      await view2.saveAs(saveAsPath);

      const savedfileContents = await fs.readFile(saveAsPath, 'utf8');
      const goodSaveAsPath = path.join(repositoryPath, file);
      const goodfileContents = await fs.readFile(goodSaveAsPath, 'utf8');
      expect(savedfileContents).toBe(goodfileContents);
    });
  });
});
