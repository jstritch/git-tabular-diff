'use babel';

import * as daff from 'daff';
import * as Diff2Html from 'diff2html';
import * as git from '../lib/git';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import zlib from 'zlib';

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

  static addPendingDiff(split, fileDiffs, ignoreCase, ignoreWhitespace, previousId = null) {
    const id = previousId ? previousId : uuidv4();
    GitTabularDiffView.pendingFileDiffs.set(id, { split, ignoreCase, ignoreWhitespace, fileDiffs });
    return id;
  }

  static getPendingDiff(id) {
    const diff = GitTabularDiffView.pendingFileDiffs.get(id);
    if (diff !== undefined) {
      GitTabularDiffView.pendingFileDiffs.delete(id);
      return diff;
    }
    return null;
  }

  static makeFileDiff(repositoryPath, relativePath, oldVersion, newVersion) {
    return { repositoryPath, relativePath, oldVersion, newVersion };
  }

  static makeUnifiedDiff(repositoryPath, relativePath, difference) {
    return { repositoryPath, relativePath, difference };
  }

  static async open(split, fileDiffs, ignoreCase, ignoreWhitespace, previousId = null) {
    // if previously saved and currently open, activate the open view
    if (previousId !== null) {
      const previousUri = GitTabularDiffView.makeUri(previousId);
      if (atom.workspace.paneForURI(previousUri)) {
        await atom.workspace.open(previousUri);
        return previousId;
      }
    }
    // open a new view
    const id = GitTabularDiffView.addPendingDiff(split, fileDiffs, ignoreCase, ignoreWhitespace, previousId);
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
      this.title = git.sysPath(serializedState.title);
      this.split = serializedState.version === 1 ? false : serializedState.split;
      this.ignoreCase = serializedState.ignoreCase;
      this.ignoreWhitespace = serializedState.ignoreWhitespace;
      this.fileDiffs = GitTabularDiffView.decompress(serializedState.fileDiffs);
    } else if (uri !== null) {
      this.element.id = uri.slice(GitTabularDiffView.getUriPrefix().length);
      // this.title is set below
      const diff = GitTabularDiffView.getPendingDiff(this.element.id);
      this.split = diff.split;
      this.ignoreCase = diff.ignoreCase;
      this.ignoreWhitespace = diff.ignoreWhitespace;
      this.fileDiffs = diff.fileDiffs;
    }

    for (const fileDiff of this.fileDiffs) {
      if (this.title === null) {
        this.title = git.sysPath(fileDiff.relativePath);
      }
      const fileBlock = this.makeFileBlock(fileDiff);
      this.element.appendChild(fileBlock);
    }
  }

  makeFileBlock(fileDiff) {
    const message = !this.split ? this.makeDaffElement(fileDiff) : this.makeD2hElement(fileDiff);

    const heading = document.createElement('h3');
    heading.classList.add('icon', 'icon-file', 'gtd-heading');
    heading.innerText = git.sysPath(fileDiff.relativePath);

    const fileBlock = document.createElement('block');
    fileBlock.classList.add('block', 'gtd-fileblock');
    fileBlock.appendChild(heading);
    fileBlock.appendChild(message);
    return fileBlock;
  }

  makeDaffElement(fileDiff) {
    const oldTable = new daff.Csv().makeTable(fileDiff.oldVersion);
    const newTable = new daff.Csv().makeTable(fileDiff.newVersion);
    const alignment = daff.compareTables(oldTable, newTable).align();
    const daffOptions = this.getDaffOptions();
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
    return message;
  }

  getDaffOptions() {
    const flags = new daff.CompareFlags();
    /* eslint-disable camelcase */
    flags.ignore_case = this.ignoreCase;
    flags.ignore_whitespace = this.ignoreWhitespace;
    /* eslint-enable camelcase */
    return flags;
  }

  makeD2hElement(fileDiff) {
    const message = document.createElement('div');
    const d2hOptions = this.getD2hOptions();
    message.innerHTML = Diff2Html.html(fileDiff.difference, d2hOptions);
    return message;
  }

  getD2hOptions() {
    return {
      outputFormat: 'side-by-side',   // split view
      drawFileList: false
    };
  }

  static compress(obj) {
    return zlib.deflateSync(JSON.stringify(obj)).toString('base64');
  }

  static decompress(str) {
    return JSON.parse(zlib.inflateSync(new Buffer.from(str, 'base64')).toString());
  }

  serialize() {
    return {
      version: 2,
      deserializer: 'GitTabularDiffView',
      id: this.element.id,
      title: git.gitPath(this.title),
      split: this.split,
      ignoreCase: this.ignoreCase,
      ignoreWhitespace: this.ignoreWhitespace,
      fileDiffs: GitTabularDiffView.compress(this.fileDiffs),
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

  async saveAs(aPath) {
    const diff = JSON.stringify(this.serialize());
    return fs.writeFile(aPath, diff);
  }

  getPath() {
    // Even though the Flight Manual states, "This is only used to set
    // the initial location of the 'save as' dialog." it is called when
    // opening the pane and logs the following to the developer console:
    // "Error: ENOENT: no such file or directory, stat '${this.title}.gtd'".
    // Just ignore the silly message unless it demonstrably causes trouble.
    return `${this.title}${GitTabularDiffView.getFileExtension()}`;
  }
}
