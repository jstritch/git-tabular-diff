'use babel';

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
