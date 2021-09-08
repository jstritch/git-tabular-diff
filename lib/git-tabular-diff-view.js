'use babel';

import * as daff from 'daff';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default class GitTabularDiffView {
  static getUriPrefix() {
    return 'atom://git-tabular-diff/';
  }

  static makeUri(id) {
    return `${GitTabularDiffView.getUriPrefix()}${id}`;
  }

  static getFileExtension() {
    return '.gtd';
  }

  // hold file diffs by key until uri is actually opened by Atom
  static pendingFileDiffs = new Map();

  static addPendingDiff(fileDiffs, previousId = null) {
    const id = previousId ? previousId : uuidv4();
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

  static async open(fileDiffs, previousId = null) {
    const id = GitTabularDiffView.addPendingDiff(fileDiffs, previousId);
    const uri = GitTabularDiffView.makeUri(id);
    await atom.workspace.open(uri);
    return id;
  }

  constructor(serializedState, uri = null) {
    this.title = null;
    this.element = document.createElement('div');
    this.element.classList.add('git-tabular-diff');

    if (serializedState !== null) {
      this.element.id = serializedState.id;
      this.fileDiffs = serializedState.fileDiffs;
    } else if (uri !== null) {
      this.element.id = uri.slice(GitTabularDiffView.getUriPrefix().length);
      this.fileDiffs = GitTabularDiffView.getPendingDiff(this.element.id);
    }
    for (const fileDiff of this.fileDiffs) {
      if (this.title === null) {
        this.title = `${fileDiff.relativePath}`;
      }
      const fileBlock = this.makeFileBlock(fileDiff);
      this.element.appendChild(fileBlock);
    }
  }

  makeFileBlock(fileDiff) {
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

    const message = document.createElement('div');
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
    heading.innerText = fileDiff.relativePath;

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

  serialize() {
    return {
      deserializer: 'GitTabularDiffView',
      id: this.element.id,
      fileDiffs: this.fileDiffs,
    };
  }

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return this.title;
  }

  getURI() {
    return GitTabularDiffView.makeUri(this.element.id);
  }

  async saveAs(path) {
    const diff = JSON.stringify({ id: this.element.id, fileDiffs: this.fileDiffs });
    return fs.writeFile(path, diff);
  }

  getPath() {
    return this.title;
  }
}
