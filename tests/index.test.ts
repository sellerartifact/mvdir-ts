import { mkdirSync, writeFileSync, rmdirSync, unlinkSync } from 'fs';
import mvdir from '@/index';

describe('Default cases', () => {
  test('mv file to file test', async () => {
    mkdirSync('source');
    writeFileSync('source/file.js', text());

    const stat = await mvdir('source/file.js', 'dest/file.js');

    unlinkSync('dest/file.js');
    rmdirSync('dest');
    rmdirSync('source');
    expect(stat).toBe(undefined);
  });

  test('mv file to dir test', async () => {
    mkdirSync('source');
    writeFileSync('source/file.js', text());

    const stat = await mvdir('source/file.js', 'dest');

    unlinkSync('dest');
    rmdirSync('source');
    expect(stat).toBe(undefined);
  });

  test('mv dir to dir test', async () => {
    mkdirSync('source');
    mkdirSync('source/a');
    mkdirSync('source/b');
    writeFileSync('source/file.js', text());
    writeFileSync('source/a/file.js', text());
    writeFileSync('source/b/file.js', text());

    const stat = await mvdir('source', 'dest');

    unlinkSync('dest/b/file.js');
    unlinkSync('dest/a/file.js');
    unlinkSync('dest/file.js');
    rmdirSync('dest/b');
    rmdirSync('dest/a');
    rmdirSync('dest');
    expect(stat).toBe(undefined);
  });

  test('mv file to deep dir test', async () => {
    mkdirSync('source');
    writeFileSync('source/file.js', text());

    const stat = await mvdir('source', 'a/b/c/dest');

    unlinkSync('a/b/c/dest/file.js');
    rmdirSync('a/b/c/dest');
    rmdirSync('a/b/c');
    rmdirSync('a/b');
    rmdirSync('a');
    expect(stat).toBe(undefined);
  });

  test('mv file to absolute path dir test', async () => {
    writeFileSync('file.js', text());

    const stat = await mvdir('file.js', 'D:\\file.js');

    unlinkSync('D:\\file.js');
    expect(stat).toBe(undefined);
  });
  test('mv deep dir file to deep dir test', async () => {
    mkdirSync('source');
    mkdirSync('source/a');
    mkdirSync('source/b');
    writeFileSync('source/file.js', text());
    writeFileSync('source/a/file.js', text());
    writeFileSync('source/b/file.js', text());

    const stat = await mvdir('source', 'dest', { copy: true });

    unlinkSync('dest/a/file.js');
    unlinkSync('dest/b/file.js');
    unlinkSync('dest/file.js');
    rmdirSync('dest/a');
    rmdirSync('dest/b');
    rmdirSync('dest');
    unlinkSync('source/b/file.js');
    unlinkSync('source/a/file.js');
    unlinkSync('source/file.js');
    rmdirSync('source/b');
    rmdirSync('source/a');
    rmdirSync('source');
    expect(stat).toBe(undefined);
  });
  test('not overwrite source file', async () => {
    mkdirSync('source');
    mkdirSync('source/a');
    mkdirSync('source/b');
    writeFileSync('source/file.js', text());
    writeFileSync('source/a/file.js', text());
    writeFileSync('source/b/file.js', text());

    const stat = await mvdir('source', 'dest', {
      copy: true,
      overwrite: false,
    });

    unlinkSync('dest/a/file.js');
    unlinkSync('dest/b/file.js');
    unlinkSync('dest/file.js');
    rmdirSync('dest/a');
    rmdirSync('dest/b');
    rmdirSync('dest');
    unlinkSync('source/b/file.js');
    unlinkSync('source/a/file.js');
    unlinkSync('source/file.js');
    rmdirSync('source/b');
    rmdirSync('source/a');
    rmdirSync('source');
    expect(stat).toBe(undefined);
  });
});

function text() {
  return [...Array(1000).fill('hello')].join('\n');
}
