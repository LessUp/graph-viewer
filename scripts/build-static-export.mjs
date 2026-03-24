#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const tempRoot = await mkdtemp(join(tmpdir(), 'graph-viewer-static-'));
const workDir = join(tempRoot, 'workspace');
const sourceNodeModules = join(projectRoot, 'node_modules');

const excludedTopLevelNames = new Set(['.git', '.next', 'out', 'node_modules']);

function shouldCopy(src) {
  const rel = relative(projectRoot, src);
  if (!rel) return true;
  const [topLevel] = rel.split('/');
  return !excludedTopLevelNames.has(topLevel);
}

function run(command, args, cwd, env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: 'inherit',
      shell: false,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`));
      }
    });
    child.on('error', rejectPromise);
  });
}

try {
  await cp(projectRoot, workDir, {
    recursive: true,
    filter: shouldCopy,
  });

  if (existsSync(sourceNodeModules)) {
    await symlink(sourceNodeModules, join(workDir, 'node_modules'), 'dir');
  }

  await rm(join(workDir, 'app', 'api'), { recursive: true, force: true });

  await run('npm', ['run', 'build'], workDir, {
    ...process.env,
    GITHUB_PAGES: 'true',
  });

  await rm(join(projectRoot, 'out'), { recursive: true, force: true });
  await cp(join(workDir, 'out'), join(projectRoot, 'out'), { recursive: true });
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
