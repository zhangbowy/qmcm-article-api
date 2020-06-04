// import 'thinkjs3-ts';
import path from 'path';
import nunjucks from 'think-view-nunjucks';
import fileSession from 'think-session-file';
import fileCache from 'think-cache-file';
const cookie = require('think-session-cookie');
import { think } from "thinkjs";
const socketio = require('think-websocket-socket.io');
// exports.websocket = {
//   type: 'socketio',
//   common: {
//     // common config
//   },
//   socketio: {
//     handle: socketio,
//     // allowOrigin: '127.0.0.1:8001',  // 默认所有的域名都允许访问
//     path: '/socket.io',             // 默认 '/socket.io'
//     adapter: null,                  // 默认无 adapter
//     messages: {
//       open: '/websocket/open',
//       close: '/websocket/close',
//       offline: '/websocket/offline',
//       sendInfo: '/websocket/sendInfo',
//     }
//   }
// }
export const cache  = {
  type: 'file',
  common: {
    timeout: 24 * 60 * 60 * 1000 // millisecond
  },
  file: {
    handle: fileCache,
    cachePath: path.join(think.ROOT_PATH, 'runtime/cache'), // absoulte path is necessarily required
    pathDepth: 1,
    gcInterval: 24 * 60 * 60 * 1000 // gc interval
  }
};
// export const session = {
//   type: 'file',
//   common: {
//     cookie: {
//       name: 'thinkjs'
//       // keys: ['werwer', 'werwer'],
//       // signed: true
//     }
//   },
//   file: {
//     handle: fileSession,
//     sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
//   }
// };
exports.session = {
  type: 'cookie',
  common: {
    // maxAge: 1000 * 60 * 60 * 24, // 1 day
    maxAge: 1000 * 60 * 60, // 1 min
    cookie: {
      // name: 'token',
      keys: ['thinkjs'],
      signed: true
    }
  },
  cookie: {
    handle: cookie,
    cookie: {
      encrypt: true //encrypt cookie data
    }
  }
}

export const view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html'
  },
  nunjucks: {
    handle: nunjucks
  }
};
