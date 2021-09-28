'use babel';

export function getSelectedFiles() {
  const selectedFiles = [];

  const activePaneItem = atom.workspace.getActivePaneItem();
  if (!activePaneItem) {
    return selectedFiles;
  }

  // from TreeView?
  if ('element' in activePaneItem) {
    const element = activePaneItem.element;
    for (const repository of element.querySelectorAll('.project-root')) {
      const repositoryPath = repository.getPath();
      for (const f of repository.querySelectorAll('.selected.file')) {
        const filePath = f.getPath();
        if (filePath.startsWith(repositoryPath)) {
          const relativePath = filePath.slice(repositoryPath.length + 1);
          selectedFiles.push({ repositoryPath, relativePath });
        }
      }
    }
  }

  // from GitHub?
  if (selectedFiles.length === 0 && 'getElement' in activePaneItem) {
    const element = activePaneItem.getElement();
    const repository = element.querySelector('.github-Project-path.input-select');
    if (repository) {
      const repositoryPath = repository[repository.selectedIndex].value;
      for (const f of element.querySelectorAll('.is-selected')) {
        const relativePath = f.innerText;
        selectedFiles.push({ repositoryPath, relativePath });
      }
    }
  }

  // from TextEditor?
  if (selectedFiles.length === 0 && 'buffer' in activePaneItem) {
    if ('getPath' in activePaneItem.buffer) {
      const filePath = activePaneItem.buffer.getPath();
      if (filePath) {
        for (const repositoryPath of atom.project.getPaths()) {
          if (filePath.startsWith(repositoryPath)) {
            const relativePath = filePath.slice(repositoryPath.length + 1);
            selectedFiles.push({ repositoryPath, relativePath });
          }
        }
      }
    }
  }

  return selectedFiles;
}
