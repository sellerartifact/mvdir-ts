/* eslint-disable consistent-return */
import { join, parse } from 'path';
import {
  access,
  mkdir,
  stat,
  unlink,
  readdir,
  rename,
  copyFile,
  rmdir,
} from 'fs/promises';

import { Options, throwErrorHelp } from './help';

export default async function mvdir(_src = '', _dest = '', _opts?: Options) {
  const src = typeof _src === 'string' ? _src : undefined;
  let dest = typeof _dest === 'string' ? _dest : undefined;
  const defOpts = { overwrite: true, copy: false, log: true };
  const opts = isObj(_opts) ? Object.assign(defOpts, _opts) : defOpts;

  // are src and dest arguments valid?
  if (!src || !dest) {
    return throwErrorHelp(opts, 1, 'Invalid argument(s).');
  }

  // does src exist?
  if (!(await exists(src))) {
    return throwErrorHelp(opts, 2, ['No such file or directory: ', src]);
  }

  // src exists.
  // if src is a file:
  const srcStats = await stat(src);
  if (!srcStats.isDirectory()) {
    // does dest exists?
    if (await exists(dest)) {
      if (!opts.overwrite) {
        return throwErrorHelp(opts, 3, ['Destination already exists: ', dest]);
      }
      const destStats = await stat(dest);
      if (destStats.isDirectory()) {
        dest = join(dest, parse(src).base);
      } // dest is a folder.
      await moveFile(src, dest, opts.copy);
      return;
    }
    // dest doesn't exist.
    const destDir = parse(dest).dir;
    if (destDir && !(await exists(destDir))) {
      await mkdir(destDir, { recursive: true });
    } // dest folder(s) don't exist.
    await moveFile(src, dest, opts.copy);
    return;
  }

  // src is a folder.
  // does dest exist?
  if (await exists(dest)) {
    if (!opts.overwrite) {
      return throwErrorHelp(opts, 3, ['Destination already exists: ', dest]);
    }
  } else {
    await mkdir(dest, { recursive: true });
  }

  // dest exists.
  // if dest is a file:
  const destStats = await stat(dest);
  if (!destStats.isDirectory()) {
    if (!opts.overwrite) {
      return throwErrorHelp(opts, 4, [
        'Destination is an existing file: ',
        dest,
      ]);
    } else {
      await unlink(dest);
      await mkdir(dest);
    }
  }

  // src and dest are both folders.
  const files = await readdir(src);
  for (const file of files) {
    const ferom = join(src, file);
    const to = join(dest, file);
    const stats = await stat(ferom);
    if (stats.isDirectory()) {
      await mvdir(ferom, to, opts);
    } else {
      await moveFile(ferom, to, opts.copy);
    }
  }
  if (!opts.copy) {
    await rmdir(src);
  }
}

async function moveFile(src: string, dest: string, copy: boolean) {
  if (copy) {
    await copyFile(src, dest);
    return;
  }
  await rename(src, dest).catch(async err => {
    if (err.code === 'EXDEV') {
      await copyFile(src, dest);
      await unlink(src);
    }
  });
}

async function exists(path: string) {
  let res = true;
  await access(path).catch(() => (res = false));
  return res;
}

function isObj(v: any) {
  return Boolean(
    v &&
      typeof v === 'object' &&
      typeof v !== null &&
      Object.prototype.toString.call(v) === '[object Object]',
  );
}
