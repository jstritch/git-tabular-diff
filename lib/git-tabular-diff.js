'use babel';

import GitTabularDiffView from './git-tabular-diff-view';
import { CompositeDisposable } from 'atom';

export default {

  gitTabularDiffView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.gitTabularDiffView = new GitTabularDiffView(state.gitTabularDiffViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.gitTabularDiffView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-tabular-diff:compare-selected-files': () => this.compareSelectedFiles()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.gitTabularDiffView.destroy();
  },

  serialize() {
    return {
      gitTabularDiffViewState: this.gitTabularDiffView.serialize()
    };
  },

  async compareSelectedFiles() {
    console.log('GitTabularDiff was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
