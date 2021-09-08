'use babel';

import * as helper from './helpers';
import { promises as fs } from 'fs';
import GitTabularDiff from '../lib/git-tabular-diff';
import GitTabularDiffView from '../lib/git-tabular-diff-view';
import path from 'path';

const repositoryPath = process.cwd();
const exampleFile = 'spec/data/example.csv';
const examplePath = path.join(repositoryPath, exampleFile);
const exampleCopyFile = 'spec/data/example-copy.csv';
const exampleCopyPath = path.join(repositoryPath, exampleCopyFile);
const exampleModifiedFile = 'spec/data/example-modified.csv';
const exampleModifiedPath = path.join(repositoryPath, exampleModifiedFile);

const saveAsFile = 'spec/data/example-saved.csv.gtd';
const saveAsPath = `${examplePath}${GitTabularDiffView.getFileExtension()}`;
const goodSaveAsPath = path.join(repositoryPath, 'spec/data/example-saved.csv.gtd');

describe('GitTabularDiffView.serialize()', function() {

  beforeEach(async function() {
    await fs.copyFile(exampleModifiedPath, examplePath);
  });

  afterEach(async function() {
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

  afterEach(async function() {
    try { await fs.unlink(saveAsPath); } catch (e) { return; }
  });

  it('saves the view so it may be shared', async function() {
    GitTabularDiff.activate(null);
    GitTabularDiff.fileSelector = helper.makeFileSelector(repositoryPath, saveAsFile);
    const id = await GitTabularDiff.compareSelectedFiles();

    expect(id).toBe('87ca2f4b-7b3f-4ee6-bb45-bdc13f8573a6');
    const workspaceElement = atom.views.getView(atom.workspace);
    expect(workspaceElement).toExist();
    let gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
    expect(gitTabularDiffElement).toExist();
    expect(gitTabularDiffElement).toHaveClass('git-tabular-diff');

    expect(GitTabularDiffView.pendingFileDiffs.size).toBe(0);

    let view = atom.workspace.getActivePaneItem();
    expect(view).toBeInstanceOf(GitTabularDiffView);
    await view.saveAs(saveAsPath);

    view.destroy();
    view = null;
    gitTabularDiffElement = workspaceElement.querySelector(`[id='${id}']`);
    expect(gitTabularDiffElement).not.toExist();

    const savedfileContents = await fs.readFile(saveAsPath, 'utf8');
    const goodfileContents = await fs.readFile(goodSaveAsPath, 'utf8');
    expect(savedfileContents).toBe(goodfileContents);
  });
});
