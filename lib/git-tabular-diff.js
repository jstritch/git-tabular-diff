'use babel';

import * as git from './git';
import * as menu from './menu';
import { CompositeDisposable, Disposable } from 'atom';
import { promises as fs } from 'fs';
import GitTabularDiffView from './git-tabular-diff-view';
import path from 'path';

export default {
  config: {
    ignoreCase: {
      description: 'Disregard capitalization when comparing files in tabular view.',
      type: 'boolean',
      default: false
    },
    ignoreWhitespace: {
      description: 'Disregard blanks when comparing files in tabular view.',
      type: 'boolean',
      default: false
    }
  },

  subscriptions: null,
  fileSelector: menu,   // dependency injection for tests

  activate(state) { // eslint-disable-line no-unused-vars
    this.subscriptions = new CompositeDisposable();

    // register an opener for the view
    atom.workspace.addOpener((uri) => {
      if (uri.startsWith(GitTabularDiffView.getUriPrefix())) {
        return new GitTabularDiffView(null, uri);
      }
      return undefined;
    });

    // register the command handler
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-tabular-diff:compare-selected-files': () => { this.compareSelectedFiles(); },
      'git-tabular-diff:compare-selected-split': () => { this.compareSelectedSplit(); },
    }));

    // destroy any GitTabularDiffViews when the package is deactivated
    new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (item instanceof GitTabularDiffView) {
          item.destroy();
        }
      });
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  deserializeGitTabularDiffView(serializedState) {
    return new GitTabularDiffView(serializedState);
  },

  filesIdentical(a, b) {
    if (a === b) {
      return true;
    }
    const nla = a.replace(/\r\n/g, '\n');
    const nlb = b.replace(/\r\n/g, '\n');
    return nla === nlb;
  },

  async compareSelectedFiles() {
    return this.compareSelected(false);
  },

  async compareSelectedSplit() {
    return this.compareSelected(true);
  },

  async compareSelected(split) {
    let id = null;
    try {
      const selectedFiles = this.fileSelector.getSelectedFiles();

      // did the user select a previously saved difference file?
      if (selectedFiles.length === 1 && selectedFiles[0].relativePath.endsWith(GitTabularDiffView.getFileExtension())) {
        try {
          const diffPath = path.join(selectedFiles[0].repositoryPath, selectedFiles[0].relativePath);
          const diffContents = await fs.readFile(diffPath, 'utf8');
          const serializedState = JSON.parse(diffContents);
          const fileDiffs = GitTabularDiffView.decompress(serializedState.fileDiffs);
          const splitView = serializedState.version === 1 ? false : serializedState.split;
          id = await GitTabularDiffView.open(splitView, fileDiffs, serializedState.ignoreCase, serializedState.ignoreWhitespace, serializedState.id);
          return id;
        } catch (e) {
          console.info(e); // eslint-disable-line no-console
          // handle as normal selection, below
        }
      }

      const fileDiffs = [];
      for (const selectedFile of selectedFiles) {
        try {
          if (!split) {
            const gitFiles = await git.readHeadAndWork(selectedFile.repositoryPath, selectedFile.relativePath);
            if (!this.filesIdentical(gitFiles.head, gitFiles.work)) {
              const fileDiff = GitTabularDiffView.makeFileDiff(selectedFile.repositoryPath, selectedFile.relativePath, gitFiles.head, gitFiles.work);
              fileDiffs.push(fileDiff);
            }
          } else {
            const difference = await git.diff(selectedFile.repositoryPath, selectedFile.relativePath);
            if (difference && difference.length > 0) {
              const fileDiff = GitTabularDiffView.makeUnifiedDiff(selectedFile.repositoryPath, selectedFile.relativePath, difference);
              fileDiffs.push(fileDiff);
            }
          }
        } catch (e) {
          console.info(e); // eslint-disable-line no-console
        }
      }

      if (fileDiffs.length > 0) {
        const ignoreCase = atom.config.get('git-tabular-diff.ignoreCase');
        const ignoreWhitespace = atom.config.get('git-tabular-diff.ignoreWhitespace');
        id = await GitTabularDiffView.open(split, fileDiffs, ignoreCase, ignoreWhitespace);
      }
    } catch (e) {
      console.info(e); // eslint-disable-line no-console
    }
    return id;
  },
};
