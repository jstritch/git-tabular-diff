'use babel';

import * as daff from 'daff';
import { v4 as uuidv4 } from 'uuid';

export default class GitTabularDiffView {
  static getUriPrefix() {
    return 'atom://git-tabular-diff/';
  }

  // hold file diffs by key until uri is actually opened by Atom
  static pendingFileDiffs = new Map();

  static addPendingDiff(fileDiffs) {
    const id = uuidv4();
    GitTabularDiffView.pendingFileDiffs.set(id, fileDiffs);
    return id;
  }

  static getPendingDiff(id) {
    const fileDiffs = GitTabularDiffView.pendingFileDiffs.get(id);
    if (fileDiffs !== undefined) {
      GitTabularDiffView.pendingFileDiffs.delete(id);
      return fileDiffs;
    }
    return null;
  }

  static makeFileDiff(repositoryPath, relativePath, oldVersion, newVersion) {
    return { repositoryPath, relativePath, oldVersion, newVersion };
  }

  static async open(fileDiffs) {
    const id = GitTabularDiffView.addPendingDiff(fileDiffs);
    const uri = `${GitTabularDiffView.getUriPrefix()}${id}`;
    await atom.workspace.open(uri);
    return id;
  }

  constructor(serializedState, uri = null) {
    this.element = document.createElement('div');
    this.element.classList.add('git-tabular-diff');
    this.repositoryPath = null;
    this.relativePath = null;

    if (uri !== null) {
      this.element.id = uri.slice(GitTabularDiffView.getUriPrefix().length);
      const fileDiffs = GitTabularDiffView.getPendingDiff(this.element.id);
      for (const fileDiff of fileDiffs) {
        if (this.repositoryPath === null) {
          this.repositoryPath = fileDiff.repositoryPath;
          this.relativePath = fileDiff.relativePath;
        }
        const fileBlock = this.makeFileBlock(fileDiff);
        this.element.appendChild(fileBlock);
      }
    }
  }

  makeFileBlock(fileDiff) {
    const message = document.createElement('div');
    const oldTable = new daff.Csv().makeTable(fileDiff.oldVersion);
    const newTable = new daff.Csv().makeTable(fileDiff.newVersion);
    const alignment = daff.compareTables(oldTable, newTable).align();
    const daffOptions = GitTabularDiffView.getDaffOptions();
    const highlighter = new daff.TableDiff(alignment, daffOptions);
    const dataDiff = [];
    const tableDiff = new daff.TableView(dataDiff);
    highlighter.hilite(tableDiff);
    const diff2html = new daff.DiffRender();
    diff2html.render(tableDiff);
    message.innerHTML = diff2html.html();
    message.classList.add('gtd-body');

    message.querySelector('table').classList.add('gtd-table');
    message.querySelectorAll('thead > tr th:nth-child(n+2),thead > tr td:nth-child(n+2)').forEach((columnHeader) => {
      columnHeader.classList.remove(...columnHeader.classList);
      columnHeader.classList.add('gtd-columnheader-cell');
    });
    message.querySelectorAll('tr th:first-child,td:first-child').forEach((action) => {
      action.classList.add('gtd-rowheader-cell');
    });
    message.querySelectorAll('tr td.modify:nth-child(n+2)').forEach((changedCell) => {
      changedCell.classList.add('gtd-changed-cell');
    });

    const heading = document.createElement('h3');
    heading.classList.add('icon', 'icon-file', 'gtd-heading');
    heading.innerText = this.relativePath;

    const fileBlock = document.createElement('block');
    fileBlock.classList.add('block', 'gtd-fileblock');
    fileBlock.appendChild(heading);
    fileBlock.appendChild(message);
    return fileBlock;
  }

  static getDaffOptions() {
    /* eslint-disable camelcase */
    const flags = new daff.CompareFlags();
    return flags;
    /* eslint-enable camelcase */
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return `${this.relativePath}.gtd`;
  }

  getURI() {
    return `${GitTabularDiffView.getUriPrefix()}${this.element.id}`;
  }
}
