import simpleGit, { SimpleGit } from 'simple-git';

export async function getStagedDiff(): Promise<string> {
  const git: SimpleGit = simpleGit();
  const diff = await git.diff(['--cached']);
  return diff;
}

export async function hasStagedChanges(): Promise<boolean> {
  const git: SimpleGit = simpleGit();
  const status = await git.status();
  return status.staged.length > 0;
}
