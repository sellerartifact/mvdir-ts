/* eslint-disable no-param-reassign */
export const log = (m1: string, m2?: string) => console.log(`[91m${m1}[0m${m2}`);

export class CustomError {
  code: number;

  message: string;

  constructor(code: number, m1: string, m2?: string) {
    let str = '';
    str += m1 || '';
    str += m2 || '';
    this.code = code;
    this.message = str;
  }
}

export interface Options {
  overwrite?: boolean;
  copy?: boolean;
  log?: boolean;
}

export function throwErrorHelp(
  opts: Options,
  customErrorCode: number,
  msg: [string, string | undefined] | string,
) {
  if (!Array.isArray(msg)) {
    msg = [msg, ''];
  }
  if (opts?.log) {
    log(msg[0], msg[1]);
  }
  return new CustomError(customErrorCode, msg[0], msg[1]);
}
