'use babel';

import * as git from './git';
import * as menu from './menu';
import { CompositeDisposable, Disposable } from 'atom';
import GitTabularDiffView from './git-tabular-diff-view';

export default {

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

  async compareSelectedFiles() {
    let id = null;
    try {
      const selectedFiles = this.fileSelector.getSelectedFiles();

      const fileDiffs = [];
      for (const selectedFile of selectedFiles) {
        try {
          const gitFiles = await git.readHeadAndWork(selectedFile.repositoryPath, selectedFile.relativePath);
          if (gitFiles.head !== gitFiles.work) {
            const fileDiff = GitTabularDiffView.makeFileDiff(
              selectedFile.repositoryPath,
              selectedFile.relativePath,
              gitFiles.head,
              gitFiles.work
            );
            fileDiffs.push(fileDiff);
          }
        } catch (e) {
          console.info(e); // eslint-disable-line no-console
        }
      }

      if (fileDiffs.length > 0) {
        id = await GitTabularDiffView.open(fileDiffs);
      }
    } catch (e) {
      console.info(e); // eslint-disable-line no-console
    }
    return id;
  },
};
