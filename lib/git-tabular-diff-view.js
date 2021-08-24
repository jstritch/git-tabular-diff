'use babel';

import { v4 as uuidv4 } from 'uuid';

export default class GitTabularDiffView {
  static getUriPrefix() {
    return 'atom://git-tabular-diff/';
  }

  // hold file diffs by key until uri is actually opened by Atom
  static fileDiffs = new Map();

  static addFileDiff(fileDiff) {
    const id = uuidv4();
    GitTabularDiffView.fileDiffs.set(id, fileDiff);
    return id;
  }

  static getFileDiff(id) {
    const fileDiff = GitTabularDiffView.fileDiffs.get(id);
    if (fileDiff !== undefined) {
      GitTabularDiffView.fileDiffs.delete(id);
      return fileDiff;
    }
    return null;
  }

  static async open(repositoryPath, relativePath, oldVersion, newVersion) {
    const fileDiff = { repositoryPath, relativePath, oldVersion, newVersion };
    const id = GitTabularDiffView.addFileDiff(fileDiff);
    const uri = `${GitTabularDiffView.getUriPrefix()}${id}`;
    return atom.workspace.open(uri);
  }

  constructor(serializedState, uri = null) {
    // create root element
    this.element = document.createElement('div');
    this.element.classList.add('git-tabular-diff');

    // create message element
    const message = document.createElement('div');

    if (uri !== null) {
      this.id = uri.slice(GitTabularDiffView.getUriPrefix().length);
      console.log(this.id);
      const fileDiff = GitTabularDiffView.getFileDiff(this.id);
      if (fileDiff !== null) {

        this.repositoryPath = fileDiff.repositoryPath;
        this.relativePath = fileDiff.relativePath;

        // generate the HTML
        message.textContent = fileDiff.newVersion;
      } else {
        throw `The fileDiff was not found for ${uri}`;
      }
    }

    this.element.id = this.id;
    this.element.appendChild(message);
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
    return `${GitTabularDiffView.getUriPrefix()}${this.id}`;
  }
}
