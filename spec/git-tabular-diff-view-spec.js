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
const goodSaveAsFile = path.join('spec', 'data', 'example-saved.csv.gtd');
const goodSaveAsIgnoreCaseFile = path.join('spec', 'data', 'example-saved-ignorecase.csv.gtd');
const goodSaveAsIgnoreWhitespaceFile = path.join('spec', 'data', 'example-saved-ignorewhitespace.csv.gtd');

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

  it('saves the view so it may be re-instantiated', async function() {
    GitTabularDiff.activate(null);
    GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, exampleFile);
    const id = await GitTabularDiff.compareSelectedFiles();

    expect(id.length).toBe(36);
    const workspaceElement = atom.views.getView(atom.workspace);
    expect(workspaceElement).toExist();
    let gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
    expect(gitTabularDiffElement).toExist();
    expect(gitTabularDiffElement).toHaveClass('git-tabular-diff');

    expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

    let view = atom.workspace.getActivePaneItem();
    expect(view).toBeInstanceOf(GitTabularDiffView);
    const serializedState = view.serialize();

    view.destroy();
    view = null;
    gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
    expect(gitTabularDiffElement).not.toExist();

    view = GitTabularDiff.deserializeGitTabularDiffView(serializedState);
    expect(view).toBeInstanceOf(GitTabularDiffView);
    expect(view.title).toBe(exampleFile);
    expect(view.getURI()).toBe(GitTabularDiffView.makeUri(id));
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

  [goodSaveAsFile, goodSaveAsIgnoreCaseFile, goodSaveAsIgnoreWhitespaceFile].forEach((file) => {
    it('saves the view with settings so it may be shared', async function() {
      GitTabularDiff.activate(null);
      GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, file);
      const id = await GitTabularDiff.compareSelectedFiles();

      const workspaceElement = atom.views.getView(atom.workspace);
      expect(workspaceElement).toExist();
      let gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
      expect(gitTabularDiffElement).toExist();
      expect(gitTabularDiffElement).toHaveClass('git-tabular-diff');

      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      // opening again should activate the existing view, not open another
      const id2 = await GitTabularDiff.compareSelectedFiles();
      expect(id2).toBe(id);
      expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

      let view = atom.workspace.getActivePaneItem();
      expect(view).toBeInstanceOf(GitTabularDiffView);
      expect(view.getPath()).toBe(saveAsFile);
      await view.saveAs(saveAsPath);

      view.destroy();
      view = null;
      gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
      expect(gitTabularDiffElement).not.toExist();

      const savedfileContents = await fs.readFile(saveAsPath, 'utf8');
      const goodSaveAsPath = path.join(repositoryPath, file);
      const goodfileContents = await fs.readFile(goodSaveAsPath, 'utf8');
      expect(savedfileContents).toBe(goodfileContents);
    });
  });
});
