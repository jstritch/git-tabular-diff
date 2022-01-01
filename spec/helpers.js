'use babel';

import GitTabularDiff from '../lib/git-tabular-diff';

export function makeFileSelector(repositoryPath, relativePath) {
  return {
    getSelectedFiles() {
      return [{
        repositoryPath,
        relativePath
      }];
    }
  };
}

export async function openView(split) {
  if (split) {
    return GitTabularDiff.compareSelectedSplit();
  }
  return GitTabularDiff.compareSelectedFiles();
}

export function getViewType(split) {
  return split ? 'split' : 'tabular';
}
