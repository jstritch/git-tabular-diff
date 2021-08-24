'use babel';

import GitTabularDiffView from './git-tabular-diff-view';
import menu from './menu';
import * as git from './git';
import { CompositeDisposable, Disposable } from 'atom';

export default {

  //gitTabularDiffView: null,
  subscriptions: null,

  activate(state) {
    console.log('activate', state);
    //this.gitTabularDiffView = new GitTabularDiffView(state.gitTabularDiffViewState);

    this.subscriptions = new CompositeDisposable();

    // register an opener for the view
    atom.workspace.addOpener(uri => {
      if (uri.startsWith(GitTabularDiffView.getUriPrefix())) {
        return new GitTabularDiffView(null, uri);
      }
    });

    // register the command handler
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-tabular-diff:compare-selected-files': () => this.compareSelectedFiles()
    }));

    // destroy any GitTabularDiffViews when the package is deactivated
    new Disposable(() => {
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof GitTabularDiffView) {
          item.destroy();
        }
      });
    });
  },

  deactivate() {
    this.subscriptions.dispose();
    //this.gitTabularDiffView.destroy();
  },

  serialize() {
    return {
      //gitTabularDiffViewState: this.gitTabularDiffView.serialize()
    };
  },

  async compareSelectedFiles() {
    const selectedFiles = menu.getSelectedFiles();

    for (const selectedFile of selectedFiles) {
      try {
        const files = await git.readHeadAndWork(selectedFile.repositoryPath, selectedFile.relativePath);
        console.log(files);
        if (files.head === files.work) {
          throw `The head and working versions of ${selectedFile.repositoryPath}/${selectedFile.relativePath} are identical.`;
        }
        await GitTabularDiffView.open(selectedFile.repositoryPath, selectedFile.relativePath, files.head, files.work);
      } catch (e) {
        console.info(e);
      }
    }
  }

};
