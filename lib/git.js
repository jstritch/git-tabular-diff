'use babel';

import { BufferedProcess } from 'atom';
import { promises as fs } from 'fs';
import path from 'path';

async function run(repositoryPath, args = []) {
  return new Promise((resolve, reject) => {
    let out = '';
    let err = '';
    const bufferedProcess = new BufferedProcess({
      command: 'git',
      args: args,
      options: {
        cwd: repositoryPath,
        env: process.env,
      },
      stdout: (data) => {
        out += data;
      },
      stderr: (data) => {
        err += data;
      },
      exit: (code) => {
        if (code === 0) {
          resolve(out);
        } else {
          reject(`The command: git ${args.join(' ')}
          for repository ${repositoryPath}
          returned exit code: ${code}.

          ${err}`);
        }
      },
    });
    bufferedProcess.process.stdin.end();
  });
}

async function pathExists(aPath) {
  try {
    await fs.access(aPath);
  } catch (e) {
    return false;
  }
  return true;
}

export function gitPath(aPath) {
  return aPath.replace(/\\/g, '/');
}

export function sysPath(aPath) {
  return path.normalize(aPath);
}

export async function readHead(repositoryPath, relativePath) {
  if (!repositoryPath) {
    throw 'The repositoryPath passed to git.readHead() must not be null.';
  } else if (!await pathExists(repositoryPath)) { // don't create process with bad cwd
    throw `The repositoryPath, ${repositoryPath}, passed to git.readHead() does not exist.`;
  } else if (!relativePath) {
    throw 'The relativePath passed to git.readHead() must not be null.';
  }

  return run(repositoryPath, ['show', `HEAD:${gitPath(relativePath)}`]);
}

export async function readWork(repositoryPath, relativePath) {
  if (!repositoryPath) {
    throw 'The repositoryPath passed to git.readWork() must not be null.';
  } else if (!relativePath) {
    throw 'The relativePath passed to git.readWork() must not be null.';
  }

  let fileContents;
  try {
    const filePath = path.join(repositoryPath, relativePath);
    fileContents = await fs.readFile(filePath, 'utf8');
  } catch (e) {
    throw e.toString();
  }
  return fileContents;
}

export async function readHeadAndWork(repositoryPath, relativePath) {
  const readBoth = Promise.all([
    readHead(repositoryPath, relativePath),
    readWork(repositoryPath, relativePath)
  ]);
  const files = await readBoth;
  return {
    head: files[0],
    work: files[1]
  };
}
