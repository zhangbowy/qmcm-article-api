import 'thinkjs3-ts';
import { think } from 'thinkjs';
import * as path from 'path';
// @ts-ignore
// const cors = require('koa-cors');
const thinkWechat = require('think-wechat');
const isDev = think.env === 'development';

export = [
  {
    handle: 'meta',
    options: {
      logRequest: true,
      // logRequest: isDev,
      sendResponseTime: true
      // sendResponseTime: isDev
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
      debug: isDev,
      templates: {
        404: path.join(think.ROOT_PATH, 'view/error/404.html'),
        500: path.join(think.ROOT_PATH, 'view/error/500.html'),
        502: path.join(think.ROOT_PATH, 'view/error/502.html')
      }
    }
  },
  {
    handle: thinkWechat,
    match: '/api/wx/wechat',
    options: {
      token: 'aaacc',
      appid: 'wx5421da096af52832',
      encodingAESKey: 'GmVWlme21bDIVVMBL2qhL0N7BDZb6jP4gSe8xXJabF3',
      checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
    }
  },
  {
    handle: 'payload',
    options: {
      uploadDir: path.join(think.RUNTIME_PATH, '_tmp'),
      keepExtensions: true,
      limit: '20mb',
    }
  },
  {
    handle: 'router',
    options: {
      prefix: ['/api'],
    }
  },
  'logic',
  'controller',
];
