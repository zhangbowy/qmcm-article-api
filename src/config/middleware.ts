import 'thinkjs3-ts';
import { think } from 'thinkjs';
import * as path from 'path';
// @ts-ignore
import system_log from '../utils/system_log';
// const cors = require('koa-cors');
const isDev = think.env === 'development';

export = [
  {
    handle: 'meta',
    options: {
      logRequest: isDev,
      sendResponseTime: isDev
    }
  },
  {
    handle: 'resource',
    enable: true,
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(static|favicon\.ico|MP_verify_mwTN1uvgPMv6HXzM\.txt)/
    }
  },
  {
    handle: 'trace',
    enable: !think.isCli,
    options: {
      debug: isDev
    }
  },
  {
    handle: 'payload',
    options: {
      uploadDir: path.join(think.RUNTIME_PATH, '_tmp'),
      keepExtensions: true,
      limit: '20mb'
    }
  },
  {
    handle: 'router',
    options: {}
  },
  'logic',
  'controller',
  {
    handle: system_log,
    options: {}
  }
];
