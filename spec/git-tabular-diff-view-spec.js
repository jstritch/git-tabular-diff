'use babel';

import * as helper from './helpers';
import { promises as fs } from 'fs';
import GitTabularDiff from '../lib/git-tabular-diff';
import GitTabularDiffView from '../lib/git-tabular-diff-view';
import path from 'path';

const methodName = 'GitTabularDiffView.serialize()';
const repositoryPath = process.cwd();
const exampleFile = 'spec/data/example.csv';
const examplePath = path.join(repositoryPath, exampleFile);
const exampleCopyFile = 'spec/data/example-copy.csv';
const exampleCopyPath = path.join(repositoryPath, exampleCopyFile);
const exampleModifiedFile = 'spec/data/example-modified.csv';
const exampleModifiedPath = path.join(repositoryPath, exampleModifiedFile);

describe(methodName, function() {

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
    expect(view.relativePath).toBe(exampleFile);
    expect(view.getURI()).toBe(GitTabularDiffView.makeUri(id));
  });
});
